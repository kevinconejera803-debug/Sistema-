Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$projectRoot = Join-Path $workspaceRoot "gestor_tu_espacio"
$excludedDirectoryNames = @(".git", ".venv", "node_modules")

$removedItems = New-Object System.Collections.Generic.List[string]
$skippedItems = New-Object System.Collections.Generic.List[string]

function Remove-PathSafely {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LiteralPath
    )

    if (-not (Test-Path -LiteralPath $LiteralPath)) {
        return
    }

    try {
        Remove-Item -LiteralPath $LiteralPath -Recurse -Force
        $removedItems.Add($LiteralPath)
    } catch {
        $skippedItems.Add($LiteralPath)
    }
}

function Remove-TreeMatches {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,
        [Parameter(Mandatory = $true)]
        [string]$Filter
    )

    if (-not (Test-Path -LiteralPath $BasePath)) {
        return
    }

    Get-ChildItem -LiteralPath $BasePath -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { -not $_.PSIsContainer -and $_.Name -like $Filter } |
        ForEach-Object { Remove-PathSafely -LiteralPath $_.FullName }
}

function Get-CleanableDirectories {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath
    )

    Get-ChildItem -LiteralPath $BasePath -Recurse -Directory -Force -ErrorAction SilentlyContinue |
        Where-Object {
            $segments = $_.FullName.Substring($workspaceRoot.Length).TrimStart("\").Split("\")
            -not ($segments | Where-Object { $_ -in $excludedDirectoryNames })
        }
}

Get-CleanableDirectories -BasePath $workspaceRoot |
    Where-Object { $_.Name -in @("__pycache__", ".pytest_cache", ".ruff_cache") } |
    ForEach-Object { Remove-PathSafely -LiteralPath $_.FullName }

Remove-TreeMatches -BasePath $workspaceRoot -Filter "*.pyc"
Remove-TreeMatches -BasePath $workspaceRoot -Filter "*.pyo"
Remove-TreeMatches -BasePath $workspaceRoot -Filter "*.tmp"

$workspaceTemp = @(
    (Join-Path $workspaceRoot "temp"),
    (Join-Path $workspaceRoot "nul")
)
foreach ($path in $workspaceTemp) {
    Remove-PathSafely -LiteralPath $path
}

$projectLogs = Join-Path $projectRoot "logs"
if (Test-Path -LiteralPath $projectLogs) {
    Get-ChildItem -LiteralPath $projectLogs -File -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne ".gitkeep" } |
        ForEach-Object { Remove-PathSafely -LiteralPath $_.FullName }
}

$backendLogDir = Join-Path $projectRoot "backend\app\logs"
if (Test-Path -LiteralPath $backendLogDir) {
    Get-ChildItem -LiteralPath $backendLogDir -File -Force -ErrorAction SilentlyContinue |
        ForEach-Object { Remove-PathSafely -LiteralPath $_.FullName }
}

Write-Host "Workspace cleanup completed."
Write-Host ("- Excluded roots: {0}" -f ($excludedDirectoryNames -join ", "))
Write-Host ("- Removed: {0}" -f $removedItems.Count)
foreach ($item in $removedItems) {
    Write-Host ("  - {0}" -f $item.Replace($workspaceRoot, "."))
}

if ($skippedItems.Count -gt 0) {
    Write-Warning ("Skipped locked or protected items: {0}" -f $skippedItems.Count)
    foreach ($item in $skippedItems) {
        Write-Warning ("  - {0}" -f $item.Replace($workspaceRoot, "."))
    }
}
