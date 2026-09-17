# Solo lectura. Requiere PowerShell y el Git instalado; no usa modulos externos.
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Get-Command git -CommandType Application -ErrorAction SilentlyContinue)) {
    throw 'Git no esta disponible en PATH.'
}

$repoRoot = Split-Path -Parent $PSScriptRoot

function Read-Git {
    param([string[]]$GitArguments)

    # Evita que status actualice opcionalmente el indice de Git.
    $result = @(& git --no-optional-locks -C $repoRoot @GitArguments)
    if ($LASTEXITCODE -ne 0) {
        throw ('Fallo git {0} (codigo {1}).' -f ($GitArguments -join ' '), $LASTEXITCODE)
    }
    return $result
}

function Show-Section {
    param([string]$Title, [string[]]$Lines)

    Write-Output ''
    Write-Output ('=== {0} ===' -f $Title)
    if ($Lines.Count -eq 0) {
        Write-Output '(sin cambios)'
    } else {
        $Lines | Write-Output
    }
}

$insideRepo = @(Read-Git -GitArguments @('rev-parse', '--is-inside-work-tree'))
if ($insideRepo -notcontains 'true') {
    throw 'El script debe pertenecer a un repositorio Git.'
}

$branch = @(Read-Git -GitArguments @('branch', '--show-current'))
if ($branch.Count -eq 0) {
    $branch = @('HEAD separado (detached HEAD)')
}
Show-Section -Title 'Rama actual' -Lines $branch

$hasCommit = @(& git --no-optional-locks -C $repoRoot rev-parse --verify --quiet HEAD)
if ($LASTEXITCODE -eq 0) {
    $lastCommit = @(Read-Git -GitArguments @('log', '-1', '--format=%h %s'))
} else {
    $lastCommit = @('(sin commits)')
}
Show-Section -Title 'Ultimo commit' -Lines $lastCommit

Show-Section -Title 'Git status --short' -Lines @(Read-Git -GitArguments @('status', '--short', '--untracked-files=all'))
Show-Section -Title 'Cambios en docs/sdd' -Lines @(Read-Git -GitArguments @('status', '--short', '--untracked-files=all', '--', 'docs/sdd/'))
Show-Section -Title 'Cambios en openspec' -Lines @(Read-Git -GitArguments @('status', '--short', '--untracked-files=all', '--', 'openspec/'))

$changesPath = Join-Path $repoRoot 'openspec/changes'
$activeChanges = @()
if (Test-Path -LiteralPath $changesPath -PathType Container) {
    $activeChanges = @(Get-ChildItem -LiteralPath $changesPath -Directory |
        Where-Object { $_.Name -ne 'archive' } |
        Sort-Object Name |
        Select-Object -ExpandProperty Name)
}
if ($activeChanges.Count -eq 0) {
    $activeChanges = @('(ninguno)')
}
Show-Section -Title 'OpenSpec changes activos (sin archive)' -Lines $activeChanges

$requiredFiles = @('docs/sdd/SDD-PROGRESS.md', 'docs/sdd/MVP-V1-FINAL-SPEC.md', 'AGENTS.md')
$fileStatus = @(foreach ($relativePath in $requiredFiles) {
    $exists = Test-Path -LiteralPath (Join-Path $repoRoot $relativePath) -PathType Leaf
    $label = if ($exists) { 'OK' } else { 'FALTA' }
    '{0}: {1}' -f $label, $relativePath
})
Show-Section -Title 'Documentos requeridos' -Lines $fileStatus
