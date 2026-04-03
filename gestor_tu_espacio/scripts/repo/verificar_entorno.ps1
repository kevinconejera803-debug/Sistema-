# Comprueba Python, dependencias, Git y (opcional) Node. Código 0 si lo crítico está bien.
# Uso (desde la raíz del repo):
#   .\gestor_tu_espacio\scripts\repo\verificar_entorno.ps1

$ErrorActionPreference = "Continue"
$repoRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
$appDir = Join-Path $repoRoot "gestor_tu_espacio"
$ok = $true

Write-Host "=== Verificación entorno (Tu espacio) ===" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"

# Python (python --version no lanza excepción en PowerShell: usar Get-Command)
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "[FALLO] Python no está en PATH. Instala Python 3.10+ y marca 'Add to PATH'." -ForegroundColor Red
  $ok = $false
} else {
  Write-Host "[OK] $(python --version 2>&1)"
}

if ($ok) {
  Push-Location $appDir
  python -c "import flask; import feedparser; import yfinance" 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FALLO] pip install -r requirements.txt en gestor_tu_espacio" -ForegroundColor Yellow
    $ok = $false
  } else {
    Write-Host "[OK] Paquetes Flask / feedparser / yfinance"
  }
  if ($ok) {
    python -c "import app" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[FALLO] import app" -ForegroundColor Red
      $ok = $false
    } else {
      Write-Host "[OK] import app"
    }
  }
  Pop-Location
}

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "[FALLO] Git no está en PATH." -ForegroundColor Red
  $ok = $false
} else {
  Write-Host "[OK] $(git --version)"
}

# Node (opcional)
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  Write-Host "[OK] Node: $(node --version)"
} else {
  Write-Host "[AVISO] Node no está en PATH (opcional; sirve para node --check en JS)." -ForegroundColor DarkYellow
}

Write-Host "=== Fin ===" -ForegroundColor Cyan
if (-not $ok) { exit 1 }
exit 0
