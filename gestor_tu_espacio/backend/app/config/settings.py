"""Configuracion de entorno y Flask."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
APP_DIR = BACKEND_DIR / "app"
INSTANCE_DIR = BACKEND_DIR / "instance"
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE, override=True)


def _as_bool(raw_value: str | None, default: bool = False) -> bool:
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _resolve_database_uri() -> str:
    database_url = (os.environ.get("DATABASE_URL") or "").strip()
    if database_url:
        return database_url

    db_path = (os.environ.get("TU_ESPACIO_DB_PATH") or "").strip()
    if db_path == ":memory:":
        return "sqlite:///:memory:"

    if db_path:
        resolved_path = Path(db_path).expanduser()
        if not resolved_path.is_absolute():
            resolved_path = BACKEND_DIR / resolved_path
    else:
        resolved_path = INSTANCE_DIR / "tu_espacio.db"

    resolved_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{resolved_path}"


class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "tu-espacio-dev-secret")
    SQLALCHEMY_DATABASE_URI = _resolve_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    TEMPLATES_AUTO_RELOAD = True

    FRONTEND_BUILD_DIR = APP_DIR / "static" / "landing"
    SEED_DEMO = _as_bool(os.environ.get("TU_ESPACIO_SEED_DEMO"), default=True)

    FLASK_HOST = os.environ.get("FLASK_HOST", "0.0.0.0")
    FLASK_PORT = int(os.environ.get("FLASK_PORT", "5000"))
    FLASK_DEBUG = _as_bool(os.environ.get("FLASK_DEBUG"), default=False)


class TestingConfig(BaseConfig):
    TESTING = True
    SEED_DEMO = False


def get_config(testing: bool = False):
    """Entrega la clase de configuracion adecuada."""
    return TestingConfig if testing else BaseConfig
