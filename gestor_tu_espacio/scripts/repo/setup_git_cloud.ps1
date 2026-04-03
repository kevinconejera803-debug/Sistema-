# Anula proxy solo para github.com (evita CONNECT tunnel 403 en /workspace y CI).
# Uso (PowerShell, desde la raíz del repo):
#   . .\gestor_tu_espacio\scripts\repo\setup_git_cloud.ps1
#   git push -u origin work
#
# Los git config redirigen stderr y no propagan fallo; al final se fuerza LASTEXITCODE=0
# para que el dot-source no deje la consola con código de salida 1.

$ErrorActionPreference = "SilentlyContinue"
$null = git config --global http.https://github.com.proxy "" 2>$null
$null = git config --global https.https://github.com.proxy "" 2>$null
if (git rev-parse --show-toplevel 2>$null) {
  $null = git config http.https://github.com.proxy "" 2>$null
  $null = git config https.https://github.com.proxy "" 2>$null
}
$np = "github.com,.github.com,*.github.com"
if ($env:NO_PROXY -notmatch "github") {
  $env:NO_PROXY = if ($env:NO_PROXY) { "$env:NO_PROXY,$np" } else { $np }
}
if ($env:no_proxy -notmatch "github") {
  $env:no_proxy = if ($env:no_proxy) { "$env:no_proxy,$np" } else { $np }
}
Write-Host "Git: sin proxy para github.com (global + repo). NO_PROXY actualizado." -ForegroundColor DarkGray
$global:LASTEXITCODE = 0
