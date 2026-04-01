"""
Audita plantillas HTML no referenciadas por la app Historia.

Uso (desde la carpeta gestor_historia, con venv activado):
  python scripts/limpiar_templates_muertos.py          # solo lista
  python scripts/limpiar_templates_muertos.py --apply  # borra archivos huérfanos

Requisitos: app.py y carpeta templates/ en el directorio de trabajo (padre de scripts/).
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app.py"
TEMPLATES = ROOT / "templates"

RENDER_RE = re.compile(r"""render_template\s*\(\s*['"]([^'"]+\.html)['"]""", re.DOTALL)
INCLUDE_RE = re.compile(r"""{%\s*include\s+['"]([^'"]+)['"]\s*%}""")
EXTENDS_RE = re.compile(r"""{%\s*extends\s+['"]([^'"]+)['"]\s*%}""")


def templates_from_app(py_text: str) -> set[str]:
    return set(RENDER_RE.findall(py_text))


def _norm(name: str) -> str:
    name = name.strip()
    return name if name.endswith(".html") else name + ".html"


def refs_from_html(html: str) -> set[str]:
    found = set()
    for m in INCLUDE_RE.finditer(html):
        found.add(_norm(m.group(1)))
    for m in EXTENDS_RE.finditer(html):
        found.add(_norm(m.group(1)))
    return found


def closure(seed: set[str]) -> set[str]:
    """Cierra el conjunto de plantillas alcanzables por include."""
    known: set[str] = set(seed)
    queue = list(seed)
    while queue:
        name = queue.pop()
        path = TEMPLATES / name
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for inc in refs_from_html(text):
            if inc not in known:
                known.add(inc)
                queue.append(inc)
    return known


def main() -> None:
    ap = argparse.ArgumentParser(description="Lista o borra templates HTML no usados en Historia.")
    ap.add_argument("--apply", action="store_true", help="Borrar archivos huérfanos")
    args = ap.parse_args()

    if not APP.is_file():
        print("No se encontró app.py en:", APP, file=sys.stderr)
        sys.exit(1)
    if not TEMPLATES.is_dir():
        print("No existe templates/ en:", TEMPLATES, file=sys.stderr)
        sys.exit(1)

    py_text = APP.read_text(encoding="utf-8", errors="replace")
    roots = templates_from_app(py_text)
    if not roots:
        print("No se encontraron render_template('*.html') en app.py.")
        sys.exit(1)

    reachable = closure(roots)
    all_html = {p.name for p in TEMPLATES.glob("*.html")}
    orphan = sorted(all_html - reachable)

    print("Plantillas raíz (desde app.py):", len(roots))
    print("Alcanzables (includes):", len(reachable))
    print("Huérfanas:", len(orphan))
    for name in orphan:
        print("  -", name)

    if args.apply:
        for name in orphan:
            p = TEMPLATES / name
            p.unlink(missing_ok=True)
            print("Eliminado:", p)
    elif orphan:
        print("\nPara borrarlas: python scripts/limpiar_templates_muertos.py --apply")


if __name__ == "__main__":
    main()
