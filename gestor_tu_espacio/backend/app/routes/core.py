"""Rutas de entrada para la SPA de frontend."""

from __future__ import annotations

from pathlib import Path

from flask import Blueprint, abort, current_app, redirect

from app.config import FRONTEND_ROUTES, LEGACY_ROUTE_REDIRECTS, logger

core_bp = Blueprint("core", __name__)

_FALLBACK_HTML = """<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tu Espacio</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Segoe UI", sans-serif;
        background: #f6f4ef;
        color: #1a1d1f;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top, rgba(181, 140, 81, 0.14), transparent 42%),
          linear-gradient(180deg, #f8f5ee 0%, #efe8da 100%);
      }
      main {
        width: min(680px, calc(100vw - 2rem));
        padding: 2rem;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 24px 80px rgba(60, 49, 33, 0.12);
      }
      h1 {
        margin: 0 0 0.75rem;
        font-size: clamp(2rem, 6vw, 3.5rem);
      }
      p {
        line-height: 1.6;
        margin: 0 0 1rem;
      }
      code {
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        background: rgba(26, 29, 31, 0.08);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Tu Espacio</h1>
      <p>La aplicacion ya funciona como una sola SPA en React.</p>
      <p>Si estas en desarrollo y aun no ves la interfaz, ejecuta <code>npm run build</code> dentro de <code>frontend/</code>.</p>
    </main>
  </body>
</html>
"""


def _frontend_index_path() -> Path:
    return Path(current_app.config["FRONTEND_BUILD_DIR"]) / "index.html"


def _serve_frontend_shell():
    index_path = _frontend_index_path()
    if index_path.exists():
        html = index_path.read_text(encoding="utf-8")
    else:
        logger.warning("No se encontro el build del frontend en %s. Se servira la pantalla de fallback.", index_path)
        html = _FALLBACK_HTML
    return current_app.response_class(html, mimetype="text/html")


@core_bp.route("/")
def index():
    """Sirve la SPA principal."""
    return _serve_frontend_shell()


@core_bp.route("/tu-espacio")
def tu_espacio():
    """Compatibilidad: el panel legacy ahora redirige a la SPA."""
    return redirect(LEGACY_ROUTE_REDIRECTS["tu-espacio"], code=302)


@core_bp.route("/trading-lab")
def trading_lab_redirect():
    logger.info("Redirigiendo /trading-lab a %s", LEGACY_ROUTE_REDIRECTS["trading-lab"])
    return redirect(LEGACY_ROUTE_REDIRECTS["trading-lab"], code=301)


@core_bp.route("/<slug>")
def spa_route(slug: str):
    """Sirve la SPA para rutas conocidas y mantiene redirecciones legacy."""
    normalized_slug = slug.strip().lower()
    if normalized_slug in FRONTEND_ROUTES:
        return _serve_frontend_shell()

    legacy_target = LEGACY_ROUTE_REDIRECTS.get(normalized_slug)
    if legacy_target is not None:
        logger.info("Redirigiendo legacy route /%s a %s", normalized_slug, legacy_target)
        return redirect(legacy_target, code=302)

    abort(404)
