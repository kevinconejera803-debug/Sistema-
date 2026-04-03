# Push con PAT (una linea de token, no se guarda en el repo tras el push).
# Ejecutar desde cualquier sitio; el script usa la raíz del repo Git (padre de gestor_tu_espacio).
#
#   cd gestor_tu_espacio\scripts\repo
#   $env:GITHUB_TOKEN = "ghp_xxxx"
#   .\push_con_token.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
Set-Location $RepoRoot

$t = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($t)) {
    Write-Host ""
    Write-Host "Ejecuta antes:" -ForegroundColor Yellow
    Write-Host '  $env:GITHUB_TOKEN = "ghp_xxxxxxxx"' -ForegroundColor Cyan
    Write-Host "  .\push_con_token.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

$repoPlain = "https://github.com/kevinconejera803-debug/Sistema-.git"
$repoAuth  = "https://${t}@github.com/kevinconejera803-debug/Sistema-.git"

git remote remove origin 2>$null
git remote add origin $repoPlain

$env:GIT_TERMINAL_PROMPT = "0"
Write-Host "Subiendo rama main..."
git push $repoAuth HEAD:main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Si ves 404: crea el repo 'Sistema-' vacio en GitHub o corrige el nombre en este script." -ForegroundColor Yellow
    Write-Host "Si ves 403: el token necesita permiso 'repo'." -ForegroundColor Yellow
    exit $LASTEXITCODE
}

git remote set-url origin $repoPlain
git config branch.main.remote origin
git config branch.main.merge refs/heads/main

Write-Host "Listo. Remoto: $repoPlain" -ForegroundColor Green
Write-Host "Para git pull despues: usa Git Credential Manager o vuelve a usar este script con token." -ForegroundColor DarkGray
