# Anula proxy solo para github.com (evita CONNECT tunnel 403 en /workspace y CI).
# Uso (PowerShell, desde la raíz del repo):
#   . .\gestor_tu_espacio\scripts\repo\setup_git_cloud.ps1
#   git push -u origin work

$ErrorActionPreference = "Continue"
git config --global http.https://github.com.proxy ""
git config --global https.https://github.com.proxy ""
if (git rev-parse --show-toplevel 2>$null) {
  git config http.https://github.com.proxy ""
  git config https.https://github.com.proxy ""
}
$np = "github.com,.github.com,*.github.com"
if ($env:NO_PROXY -notmatch "github") {
  $env:NO_PROXY = if ($env:NO_PROXY) { "$env:NO_PROXY,$np" } else { $np }
}
if ($env:no_proxy -notmatch "github") {
  $env:no_proxy = if ($env:no_proxy) { "$env:no_proxy,$np" } else { $np }
}
Write-Host "Git: sin proxy para github.com (global + repo). NO_PROXY actualizado." -ForegroundColor DarkGray
