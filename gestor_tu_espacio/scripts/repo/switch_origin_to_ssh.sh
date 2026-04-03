#!/usr/bin/env sh
# Si "git push" con HTTPS falla: CONNECT tunnel failed, response 403
# en /workspace, CI o detrás de proxy: cambia origin a SSH.
# Requisitos: clave en ~/.ssh, clave pública en GitHub, ssh -T git@github.com OK.
set -e
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Ejecuta desde dentro del clon Git." >&2
  exit 1
}
cd "$REPO_ROOT"
git remote set-url origin git@github.com:kevinconejera803-debug/Sistema-.git
echo "Remoto actual:"
git remote -v
echo ""
echo "Siguiente: ssh -T git@github.com"
echo "Luego:     git push -u origin work"
