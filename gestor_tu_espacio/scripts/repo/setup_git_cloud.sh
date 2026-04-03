#!/usr/bin/env sh
# Anula el proxy HTTP(S) solo para github.com (evita "CONNECT tunnel failed, response 403"
# en Cursor /workspace, contenedores y CI donde un proxy global rompe el túnel CONNECT).
#
# Uso (desde la raíz del repo):
#   . gestor_tu_espacio/scripts/repo/setup_git_cloud.sh
#   git push -u origin work

_git_cloud_bypass_github() {
  git config --global http.https://github.com.proxy "" 2>/dev/null || true
  git config --global https.https://github.com.proxy "" 2>/dev/null || true
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    git config http.https://github.com.proxy ""
    git config https.https://github.com.proxy ""
  fi
  _np="github.com,.github.com,*.github.com"
  case ":${NO_PROXY:-}:" in *"github.com"*) ;; *)
    NO_PROXY="${NO_PROXY:+$NO_PROXY,}$_np"
    export NO_PROXY
    ;;
  esac
  case ":${no_proxy:-}:" in *"github.com"*) ;; *)
    no_proxy="${no_proxy:+$no_proxy,}$_np"
    export no_proxy
    ;;
  esac
}

_git_cloud_bypass_github
