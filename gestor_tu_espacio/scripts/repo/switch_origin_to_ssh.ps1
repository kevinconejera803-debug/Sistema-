# Configura origin en SSH: añade el remoto si no existe o corrige la URL.
# Uso (PowerShell, desde la raíz del repo):
#   .\gestor_tu_espacio\scripts\repo\switch_origin_to_ssh.ps1
#   .\gestor_tu_espacio\scripts\repo\switch_origin_to_ssh.ps1 -Branch main
#
# Requisitos: clave SSH en el entorno y clave pública en GitHub.
# Opcional: $env:GIT_ORIGIN_SSH = "git@github.com:usuario/otro-repo.git"

param(
  [string] $Branch = "work"
)

$ErrorActionPreference = "Stop"
$originSsh = if ($env:GIT_ORIGIN_SSH) { $env:GIT_ORIGIN_SSH } else { "git@github.com:kevinconejera803-debug/Sistema-.git" }

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
  Write-Host "No hay repositorio Git aquí. Clona primero, por ejemplo:" -ForegroundColor Yellow
  Write-Host "  git clone $originSsh C:\ruta\Ejercicios-practicos" -ForegroundColor Cyan
  exit 1
}

Push-Location $repoRoot
try {
  git remote get-url origin 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $originSsh
    Write-Host "Remoto origin actualizado." -ForegroundColor DarkGreen
  }
  else {
    git remote add origin $originSsh
    Write-Host "Remoto origin añadido." -ForegroundColor DarkGreen
  }
  Write-Host "Remoto actual:" -ForegroundColor Cyan
  git remote -v
  Write-Host ""
  Write-Host "Siguiente: ssh -T git@github.com" -ForegroundColor DarkGray
  Write-Host "Luego:     git push -u origin $Branch" -ForegroundColor DarkGray
}
finally {
  Pop-Location
}
