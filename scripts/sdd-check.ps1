# Valida sin editar fuentes/configuracion ni instalar dependencias.
# Fetch actualiza referencias Git; los tests pueden usar fixtures y build genera dist.
# Working tree DIRTY es informativo: las validaciones se usan tambien antes del commit.
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$summary = [ordered]@{
    'Git sync' = 'ERROR'
    'SDD docs' = 'ERROR'
    'OpenSpec' = 'N/A'
    'Backend tests' = 'ERROR'
    'Frontend lint' = 'ERROR'
    'Frontend build' = 'ERROR'
    'Diff check' = 'ERROR'
    'Working tree' = 'DIRTY'
}

function Invoke-CheckCommand {
    param([string]$Command, [string[]]$CommandArgs, [string]$Directory = $repoRoot)

    Write-Host "`n> $Command $($CommandArgs -join ' ')"
    $entered = $false
    try {
        $executable = Get-Command $Command -CommandType Application -ErrorAction Stop | Select-Object -First 1
        Push-Location -LiteralPath $Directory
        $entered = $true
        # Los mensajes stderr nativos no deben abortar los siguientes controles.
        $ErrorActionPreference = 'Continue'
        $output = @(& $executable.Source @CommandArgs 2>&1)
        $code = $LASTEXITCODE
        foreach ($line in $output) { Write-Host ($line.ToString()) }
        if ($code -ne 0) { Write-Host "ERROR: codigo $code" }
        return [pscustomobject]@{ Success = ($code -eq 0); Lines = @($output | ForEach-Object { "$_" }) }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
        return [pscustomobject]@{ Success = $false; Lines = @() }
    } finally {
        if ($entered) { Pop-Location }
    }
}

# 1. Actualizar referencias (sin pull, push ni cambios en fuentes).
$fetch = Invoke-CheckCommand 'git' @('fetch', 'origin')

# 2. Estado Git. El remoto comparado es el upstream de la rama actual.
$branch = Invoke-CheckCommand 'git' @('--no-optional-locks', 'branch', '--show-current')
$upstream = Invoke-CheckCommand 'git' @('--no-optional-locks', 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}')
$counts = Invoke-CheckCommand 'git' @('--no-optional-locks', 'rev-list', '--left-right', '--count', 'HEAD...@{upstream}')
if ($counts.Success -and $counts.Lines.Count -eq 1) {
    $parts = $counts.Lines[0].Trim() -split '\s+'
    if ($parts.Count -eq 2) {
        Write-Host "Ahead: $($parts[0]); Behind: $($parts[1])"
        if ($fetch.Success -and $branch.Success -and $upstream.Success -and
            ($branch.Lines -join '').Trim() -ne '' -and $parts[0] -eq '0' -and $parts[1] -eq '0') {
            $summary['Git sync'] = 'OK'
        }
    }
} else {
    Write-Host 'Ahead/behind: no calculable; verificar upstream y referencias.'
}
if (-not $fetch.Success) { Write-Host 'Fetch fallo: las referencias remotas pueden estar desactualizadas.' }
$localLog = Invoke-CheckCommand 'git' @('--no-optional-locks', 'log', '-1', '--format=Local: %h %s')
$remoteLog = Invoke-CheckCommand 'git' @('--no-optional-locks', 'log', '-1', '--format=Remoto (upstream): %h %s', '@{upstream}')
$initialStatus = Invoke-CheckCommand 'git' @('--no-optional-locks', 'status', '--short', '--untracked-files=all')
if (-not ($localLog.Success -and $remoteLog.Success -and $initialStatus.Success)) { $summary['Git sync'] = 'ERROR' }

# 3. Ejecutar el script existente en otro proceso para aislar exit/errores.
$statusScript = Invoke-CheckCommand 'powershell' @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'sdd-status.ps1'))

# 4. Documentacion requerida.
$docsOk = $true
foreach ($path in @('AGENTS.MD', 'docs/sdd/SDD-PROGRESS.md', 'docs/sdd/MVP-V1-FINAL-SPEC.md', 'docs/sdd/SDD-WORKFLOW.md', 'docs/sdd/SDD-SESSION-CHECKLIST.md')) {
    try {
        if (Test-Path -LiteralPath (Join-Path $repoRoot $path) -PathType Leaf) {
            Write-Host "OK: $path"
        } else {
            Write-Host "FALTA: $path"
            $docsOk = $false
        }
    } catch {
        Write-Host "ERROR: $path - $($_.Exception.Message)"
        $docsOk = $false
    }
}
if ($docsOk) { $summary['SDD docs'] = 'OK' }

# 5. Changes activos: directorios inmediatos, excluyendo archive.
try {
    $changesPath = Join-Path $repoRoot 'openspec/changes'
    $changes = @()
    if (Test-Path -LiteralPath $changesPath -PathType Container) {
        $changes = @(Get-ChildItem -LiteralPath $changesPath -Directory | Where-Object { $_.Name -ne 'archive' } | Sort-Object Name)
    }
    if ($changes.Count -eq 0) {
        Write-Host 'sin changes activos'
    } else {
        $summary['OpenSpec'] = 'OK'
        foreach ($change in $changes) { Write-Host "Change activo: $($change.Name)" }
        foreach ($change in $changes) {
            $validation = Invoke-CheckCommand 'openspec.cmd' @('validate', $change.Name, '--strict')
            if (-not $validation.Success) { $summary['OpenSpec'] = 'ERROR' }
        }
    }
} catch {
    Write-Host "ERROR OpenSpec: $($_.Exception.Message)"
    $summary['OpenSpec'] = 'ERROR'
}

# 6. Sin npm install: usa las dependencias ya disponibles.
foreach ($check in @(
    @{ Label = 'Backend tests'; Folder = 'backend'; Arguments = @('test') },
    @{ Label = 'Frontend lint'; Folder = 'frontend'; Arguments = @('run', 'lint') },
    @{ Label = 'Frontend build'; Folder = 'frontend'; Arguments = @('run', 'build') }
)) {
    try {
        $directory = Join-Path $repoRoot $check.Folder
        if (Test-Path -LiteralPath (Join-Path $directory 'package.json') -PathType Leaf) {
            $result = Invoke-CheckCommand 'npm.cmd' $check.Arguments $directory
            if ($result.Success) { $summary[$check.Label] = 'OK' }
        } else {
            # La validacion es condicional a la existencia de package.json.
            Write-Host "$($check.Label): omitido, no existe $($check.Folder)/package.json"
            $summary[$check.Label] = 'OK'
        }
    } catch { Write-Host "ERROR $($check.Label): $($_.Exception.Message)" }
}

# 7. Diff y estado final. No limpiar ni ignorar silenciosamente untracked.
$diff = Invoke-CheckCommand 'git' @('--no-optional-locks', 'diff', '--check')
if ($diff.Success) { $summary['Diff check'] = 'OK' }
$finalStatus = Invoke-CheckCommand 'git' @('--no-optional-locks', 'status', '--short', '--untracked-files=all')
if ($finalStatus.Success -and $finalStatus.Lines.Count -eq 0) { $summary['Working tree'] = 'CLEAN' }
Write-Host 'FRONTEND-UI-CONTEXT.md puede ser untracked conocido; se informa sin modificarlo.'

# 8. Resumen y codigo de salida: DIRTY no es un fallo de validacion.
Write-Host "`n=== Resumen SDD ==="
foreach ($entry in $summary.GetEnumerator()) { Write-Host "$($entry.Key): $($entry.Value)" }
Write-Host "SDD status script: $(if ($statusScript.Success) { 'OK' } else { 'ERROR' })"
if ($summary.Values -contains 'ERROR' -or -not $statusScript.Success -or -not $finalStatus.Success) { exit 1 }
exit 0
