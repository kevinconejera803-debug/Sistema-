#!/usr/bin/env sh
# Empuja una rama evitando proxy incorrecto hacia GitHub (403 CONNECT).
# Uso (raíz del repo):
#   chmod +x gestor_tu_espacio/scripts/repo/push_with_cloud_fix.sh
#   ./gestor_tu_espacio/scripts/repo/push_with_cloud_fix.sh work
#   ./gestor_tu_espacio/scripts/repo/push_with_cloud_fix.sh main origin

set -e
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
# shellcheck source=/dev/null
. "$SCRIPT_DIR/setup_git_cloud.sh"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Ejecuta desde dentro del clon Git (cd /workspace/Sistema- o tu carpeta)." >&2
  exit 1
}
cd "$REPO_ROOT"

BRANCH=${1:-$(git branch --show-current)}
REMOTE=${2:-origin}

echo "push: $REMOTE -> $BRANCH (sin proxy para github.com)"
git push -u "$REMOTE" "$BRANCH"
