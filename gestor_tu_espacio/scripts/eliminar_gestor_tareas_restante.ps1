# Elimina la carpeta gestor_tareas en la raiz del repo (monolito antiguo).
# Ejecutar desde aqui:  .\eliminar_gestor_tareas_restante.ps1
# Cierra antes cualquier Python que use ese proyecto.

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$target = Join-Path $repoRoot 'gestor_tareas'

if (-not (Test-Path $target)) {
    Write-Host "No existe: $target (nada que borrar)."
    exit 0
}

Write-Host "Se eliminara: $target"
Remove-Item -LiteralPath $target -Recurse -Force
Write-Host 'Listo.'
