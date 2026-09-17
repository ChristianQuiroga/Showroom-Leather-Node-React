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
$branchName = if ($branch.Count -gt 0) { $branch[0] } else { $null }
if ($branch.Count -eq 0) {
    $branch = @('HEAD separado (detached HEAD)')
}
Show-Section -Title 'Rama actual' -Lines $branch

$remotes = @(Read-Git -GitArguments @('remote'))
$origin = if ($remotes -contains 'origin') {
    @(Read-Git -GitArguments @('remote', 'get-url', '--all', 'origin'))
} else {
    @('(origin no configurado)')
}
Show-Section -Title 'Remote origin' -Lines $origin

$localCommit = @(& git --no-optional-locks -C $repoRoot rev-parse --verify --quiet 'HEAD^{commit}')
$hasLocalCommit = $LASTEXITCODE -eq 0
if ($hasLocalCommit) {
    $lastCommit = @(Read-Git -GitArguments @('log', '-1', '--format=%h %s'))
} else {
    $lastCommit = @('(sin commits)')
}
Show-Section -Title 'Ultimo commit local' -Lines $lastCommit

$upstream = @()
if ($branchName) {
    $upstream = @(Read-Git -GitArguments @('for-each-ref', '--format=%(upstream)', ('refs/heads/' + $branchName)) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}
$upstreamRef = if ($upstream.Count -gt 0) { $upstream[0] } else { $null }
$upstreamLabel = if ($upstreamRef) { $upstreamRef } else { '(sin upstream configurado)' }
Show-Section -Title 'Upstream configurado' -Lines @($upstreamLabel)

Show-Section -Title 'Alcance de la comparacion' -Lines @(
    'Ahead/behind usa referencias remotas locales; pueden estar desactualizadas.',
    'Para conocer el estado actual de GitHub, primero puede ejecutar manualmente: git fetch origin',
    'Este script NO ejecuta fetch, pull ni push.'
)

function Show-Comparison {
    param([string]$Title, [string]$Reference)

    if (-not $Reference) {
        Show-Section -Title $Title -Lines @('Ahead: no calculable', 'Behind: no calculable', 'Ultimo commit de referencia: no disponible')
        return
    }
    $referenceCommit = @(& git --no-optional-locks -C $repoRoot rev-parse --verify --quiet ($Reference + '^{commit}'))
    if ($LASTEXITCODE -ne 0) {
        Show-Section -Title $Title -Lines @('Ahead: no calculable', 'Behind: no calculable', 'Referencia no disponible localmente: ' + $Reference)
        return
    }
    $referenceLog = @(Read-Git -GitArguments @('log', '-1', '--format=%h %s', $referenceCommit[0], '--'))
    $lines = @('Ultimo commit de referencia: ' + $referenceLog[0])
    if ($hasLocalCommit) {
        $counts = @(Read-Git -GitArguments @('rev-list', '--left-right', '--count', ($localCommit[0] + '...' + $referenceCommit[0]), '--'))
        $parts = $counts[0].Trim() -split '\s+'
        $lines += 'Ahead: ' + $parts[0]
        $lines += 'Behind: ' + $parts[1]
    } else {
        $lines += 'Ahead: no calculable (sin commit local)'
        $lines += 'Behind: no calculable (sin commit local)'
    }
    Show-Section -Title $Title -Lines $lines
}

Show-Comparison -Title 'Comparacion con upstream' -Reference $upstreamRef
Show-Comparison -Title 'Comparacion con origin/main' -Reference 'refs/remotes/origin/main'

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
