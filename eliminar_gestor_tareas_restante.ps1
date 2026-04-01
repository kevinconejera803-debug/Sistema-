$ErrorActionPreference = "Stop"
$target = Join-Path $PSScriptRoot "gestor_tareas"
if (-not (Test-Path $target)) { Write-Host "No existe gestor_tareas."; exit 0 }
Remove-Item -LiteralPath $target -Recurse -Force
Write-Host "Listo."
