#!/usr/bin/env sh
# Configura origin en SSH: añade el remoto si no existe o corrige la URL.
# (Evita CONNECT 403 con HTTPS en /workspace, CI o proxy.)
# Uso: ./switch_origin_to_ssh.sh [rama]
# Requisitos: clave en ~/.ssh, clave pública en GitHub, ssh -T git@github.com OK.
set -eu
BRANCH=${1:-work}
ORIGIN_SSH="${GIT_ORIGIN_SSH:-git@github.com:kevinconejera803-debug/Sistema-.git}"
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "No hay repositorio Git aquí. Clona primero, por ejemplo:" >&2
  echo "  git clone $ORIGIN_SSH /workspace/Sistema-" >&2
  exit 1
}
cd "$REPO_ROOT"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$ORIGIN_SSH"
  echo "Remoto origin actualizado."
else
  git remote add origin "$ORIGIN_SSH"
  echo "Remoto origin añadido."
fi
echo "Remoto actual:"
git remote -v
echo ""
echo "Siguiente: ssh -T git@github.com"
echo "Luego:     git push -u origin $BRANCH"
