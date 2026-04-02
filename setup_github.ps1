# Crea el repo en GitHub y hace push (requiere GitHub CLI: gh).
# 1) Ejecuta una vez: gh auth login
# 2) Luego: .\setup_github.ps1
# Opcional: $env:GITHUB_REPO_NAME = "mi-repo"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "Instala GitHub CLI: https://cli.github.com/"
}

$authOk = $false
try {
    & gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $authOk = $true }
} catch { }

if (-not $authOk) {
    Write-Host ""
    Write-Host "=== ACCION REQUERIDA ===" -ForegroundColor Yellow
    Write-Host "No hay sesion en GitHub. En ESTA misma ventana ejecuta:" -ForegroundColor White
    Write-Host "  gh auth login" -ForegroundColor Cyan
    Write-Host "Elige GitHub.com, HTTPS, y autenticate (navegador o token)." -ForegroundColor White
    Write-Host "Cuando termine, vuelve a ejecutar: .\setup_github.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

$repoName = $env:GITHUB_REPO_NAME
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "ejercicios-practicos"
}

$hasOrigin = $false
try {
    git remote get-url origin 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $hasOrigin = $true }
} catch { }

if ($hasOrigin) {
    Write-Host "Remote 'origin' ya existe. Subiendo cambios..."
    git push -u origin main
    exit $LASTEXITCODE
}

Write-Host "Creando repositorio '$repoName' y subiendo rama main..."
& gh repo create $repoName --public --source=. --remote=origin --push --description "Dos apps Flask: gestor_tu_espacio y gestor_historia"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$user = (& gh api user -q .login).Trim()
Write-Host ""
Write-Host "Listo: https://github.com/$user/$repoName" -ForegroundColor Green
