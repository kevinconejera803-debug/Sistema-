#!/usr/bin/env sh
# Push a GitHub sin variables de proxy de entorno (mitiga 403 CONNECT).
# Uso (raíz del repo):
#   chmod +x gestor_tu_espacio/scripts/repo/push_github_direct.sh
#   ./gestor_tu_espacio/scripts/repo/push_github_direct.sh
#   ./gestor_tu_espacio/scripts/repo/push_github_direct.sh push -u origin work

set -e
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
# shellcheck source=/dev/null
. "$SCRIPT_DIR/setup_git_cloud.sh"

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Ejecuta desde dentro del clon Git." >&2
  exit 1
}
cd "$REPO_ROOT"

_save_http_proxy="${HTTP_PROXY-}"
_save_https_proxy="${HTTPS_PROXY-}"
_save_all_proxy="${ALL_PROXY-}"
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy 2>/dev/null || true

if [ "$#" -eq 0 ]; then
  set -- push -u origin main
fi

echo "git (sin proxy de entorno, HTTP/1.1): $*"
git -c http.version=HTTP/1.1 "$@"
code=$?

HTTP_PROXY="${_save_http_proxy:-}"
HTTPS_PROXY="${_save_https_proxy:-}"
ALL_PROXY="${_save_all_proxy:-}"
export HTTP_PROXY HTTPS_PROXY ALL_PROXY 2>/dev/null || true

if [ "$code" -ne 0 ]; then
  echo "" >&2
  echo "Si sigue 403: prueba remote SSH o permisos de red hacia github.com:443." >&2
fi
exit "$code"
