# Instala el hook post-commit (auto-push tras cada git commit).
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot
$hook = Join-Path $PSScriptRoot "git-hooks\post-commit"
$dest = Join-Path $repoRoot ".git\hooks\post-commit"
if (-not (Test-Path $hook)) { Write-Error "No existe $hook"; exit 1 }
Copy-Item -Force $hook $dest
Write-Host "Hook instalado: $dest" -ForegroundColor Green
Write-Host "Cada 'git commit' intentara 'git push origin main' (silencioso si falla)." -ForegroundColor DarkGray
