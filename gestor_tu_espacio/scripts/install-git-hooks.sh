#!/usr/bin/env sh
# Instala post-commit en la raíz del repo (Linux/macOS, p. ej. /workspace/Sistema-).
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Ejecuta desde dentro del clon Git." >&2
  exit 1
}
HOOK_SRC="$REPO_ROOT/gestor_tu_espacio/scripts/git-hooks/post-commit"
HOOK_DST="$REPO_ROOT/.git/hooks/post-commit"
if [ ! -f "$HOOK_SRC" ]; then
  echo "No existe $HOOK_SRC" >&2
  exit 1
fi
cp -f "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "Hook instalado: $HOOK_DST"
