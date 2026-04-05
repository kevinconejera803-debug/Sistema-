"""
Tu espacio — Flask: SYSTEM INTERFACE, módulos funcionales y APIs mejorada.
Limpiada la duplicación: ahora delega en Blueprints (Fase 1.2).
"""
from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify

from app.config import logger
from app.database import db, init_db

# Cache simple con TTL
class _Cache:
    def __init__(self):
        self._store: dict[str, dict[str, Any]] = {}
    
    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        if time.time() - entry["t"] >= entry["ttl"]:
            del self._store[key]
            return None
        return entry["v"]
    
    def set(self, key: str, value: Any, ttl: float) -> None:
        self._store[key] = {"v": value, "t": time.time(), "ttl": ttl}
    
    def invalidate(self, key: str) -> None:
        self._store.pop(key, None)

cache = _Cache()

# Cargar variables de entorno
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = Flask(__name__)

# Disable template caching
app.jinja_env.cache = None

# Variable auxiliar
_app_ready = False

def _flask_debug() -> bool:
    """Modo debug solo si FLASK_DEBUG=1/true/yes (más seguro que True fijo)."""
    v = os.environ.get("FLASK_DEBUG", "0").strip().lower()
    return v in ("1", "true", "yes")

def ensure_app_ready() -> None:
    """Inicializa recursos críticos una sola vez por proceso."""
    global _app_ready
    if _app_ready:
        return

    init_db(app)
    _app_ready = True
    logger.info("Aplicación inicializada via Blueprints")

# Registrar Blueprints
from app.blueprints.calendar import calendar_bp
from app.blueprints.contacts import contacts_bp
from app.blueprints.university import university_bp
from app.blueprints.news import news_bp
from app.blueprints.markets import markets_bp
from app.blueprints.core import core_bp
from app.blueprints.research import research_bp
from app.blueprints.health import health_bp

app.register_blueprint(calendar_bp)
app.register_blueprint(contacts_bp)
app.register_blueprint(university_bp)
app.register_blueprint(news_bp)
app.register_blueprint(markets_bp)
app.register_blueprint(core_bp)
app.register_blueprint(research_bp)
app.register_blueprint(health_bp)

# Invocamos ensure_app_ready() para inicializar base de datos y migraciones globalmente.
ensure_app_ready()

# ——— ERROR HANDLERS ———

@app.errorhandler(404)
def not_found(e):
    """Manejador para 404."""
    logger.warning(f"404 no encontrado")
    return jsonify({"error": "no encontrado"}), 404

@app.errorhandler(500)
def server_error(e):
    """Manejador para 500."""
    logger.error(f"Error interno del servidor: {e}", exc_info=True)
    return jsonify({"error": "error interno del servidor"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    logger.info(f"Iniciando servidor (Blueprints Mode) en {host}:{port}")
    app.run(host=host, port=port, debug=_flask_debug())
