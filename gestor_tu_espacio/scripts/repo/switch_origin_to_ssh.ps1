# Cambia origin de HTTPS a SSH (evita CONNECT 403 con proxy).
# Uso (PowerShell, desde la raíz del repo):
#   .\gestor_tu_espacio\scripts\repo\switch_origin_to_ssh.ps1
#   .\gestor_tu_espacio\scripts\repo\switch_origin_to_ssh.ps1 -Branch main
#
# Requisitos: clave SSH en el entorno y clave pública en GitHub.

param(
  [string] $Branch = "work"
)

$ErrorActionPreference = "Stop"
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
  Write-Error "Ejecuta desde dentro del clon Git."
  exit 1
}

Push-Location $repoRoot
try {
  git remote set-url origin "git@github.com:kevinconejera803-debug/Sistema-.git"
  Write-Host "Remoto actual:" -ForegroundColor Cyan
  git remote -v
  Write-Host ""
  Write-Host "Siguiente: ssh -T git@github.com" -ForegroundColor DarkGray
  Write-Host "Luego:     git push -u origin $Branch" -ForegroundColor DarkGray
}
finally {
  Pop-Location
}
