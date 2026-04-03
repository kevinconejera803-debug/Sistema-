#!/usr/bin/env sh
# Push con PAT (misma idea que push_con_token.ps1). No guarda el token en el repo.
#
#   cd gestor_tu_espacio/scripts/repo
#   export GITHUB_TOKEN="ghp_xxxx"
#   ./push_con_token.sh
#
# Opcional: rama distinta a main
#   ./push_con_token.sh work

set -e
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
# shellcheck source=/dev/null
. "$SCRIPT_DIR/setup_git_cloud.sh"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Ejecuta desde dentro del clon Git." >&2
  exit 1
}
cd "$REPO_ROOT"

BRANCH=${1:-main}

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo ""
  echo "Ejecuta antes:" >&2
  echo '  export GITHUB_TOKEN="ghp_xxxxxxxx"' >&2
  echo "  ./push_con_token.sh [rama]" >&2
  echo ""
  exit 1
fi

REPO_PLAIN="https://github.com/kevinconejera803-debug/Sistema-.git"
REPO_AUTH="https://${GITHUB_TOKEN}@github.com/kevinconejera803-debug/Sistema-.git"

git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_PLAIN"

export GIT_TERMINAL_PROMPT=0
echo "Subiendo rama $BRANCH..."
if ! git push "$REPO_AUTH" "HEAD:$BRANCH"; then
  echo "" >&2
  echo "Si ves 404: crea el repo vacío o corrige la URL en este script." >&2
  echo "Si ves 403: el token necesita permiso 'repo'." >&2
  exit 1
fi

git remote set-url origin "$REPO_PLAIN"
git config "branch.$BRANCH.remote" origin
git config "branch.$BRANCH.merge" "refs/heads/$BRANCH"

echo "Listo. Remoto: $REPO_PLAIN"
