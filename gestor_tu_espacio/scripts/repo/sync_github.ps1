# Sube la rama main al repositorio de GitHub (remoto ya creado en github.com).
#
# Primera vez (sin origin):
#   .\sync_github.ps1 https://github.com/TU_USUARIO/TU_REPO.git
#
# Si origin ya apunta a tu repo:
#   .\sync_github.ps1
#
# Ubicación: gestor_tu_espacio/scripts/repo/ (cd ahí o usa ruta completa al .ps1)

param(
    [string]$RemoteUrl = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
Set-Location $RepoRoot

function Get-HasOrigin {
    try {
        git remote get-url origin 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

if ($RemoteUrl) {
    Write-Host "Configurando origin -> $RemoteUrl"
    git remote remove origin 2>$null
    git remote add origin $RemoteUrl
}

if (-not (Get-HasOrigin)) {
    Write-Host ""
    Write-Host "No hay remoto 'origin'. Pasa la URL del repo en GitHub:" -ForegroundColor Yellow
    Write-Host "  .\sync_github.ps1 https://github.com/USUARIO/NOMBRE-REPO.git" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Subiendo rama main..."
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Hecho." -ForegroundColor Green
}
