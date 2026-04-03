# Push a GitHub evitando proxy roto (403 CONNECT tunnel).
# Quita HTTP_PROXY/HTTPS_PROXY/ALL_PROXY solo para esta invocación de git (no toca el sistema).
#
# Uso (desde la raíz del repo):
#   .\gestor_tu_espacio\scripts\repo\push_github_direct.ps1
#   .\gestor_tu_espacio\scripts\repo\push_github_direct.ps1 push -u origin work
#
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
Set-Location $RepoRoot

. (Join-Path $PSScriptRoot "setup_git_cloud.ps1")

# Quitar proxy de proceso (Git/libcurl a veces lo usa aunque NO_PROXY incluya github.com)
$proxyNames = @("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy")
$saved = @{}
foreach ($n in $proxyNames) {
  $saved[$n] = (Get-Item "Env:$n" -ErrorAction SilentlyContinue).Value
  Remove-Item "Env:$n" -ErrorAction SilentlyContinue
}

$gitArgs = @($args)
if ($gitArgs.Count -gt 0 -and $gitArgs[0] -eq "git") {
  $gitArgs = $gitArgs[1..($gitArgs.Count - 1)]
}
if ($gitArgs.Count -eq 0) {
  $gitArgs = @("push", "-u", "origin", "main")
}

Write-Host "git (sin proxy de entorno, HTTP/1.1):" ($gitArgs -join " ") -ForegroundColor DarkCyan
& git -c http.version=HTTP/1.1 @gitArgs
$exit = $LASTEXITCODE

# Restaurar variables de proxy en esta sesión
foreach ($n in $proxyNames) {
  $v = $saved[$n]
  if ($null -eq $v -or $v -eq "") {
    Remove-Item "Env:$n" -ErrorAction SilentlyContinue
  } else {
    Set-Item -Path "Env:$n" -Value $v
  }
}

if ($exit -ne 0) {
  Write-Host ""
  Write-Host "Si sigue 403: prueba SSH (git@github.com:...) o pide a IT que permita CONNECT a github.com:443." -ForegroundColor Yellow
  exit $exit
}
exit 0
