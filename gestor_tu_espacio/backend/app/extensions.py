"""Extensiones y utilidades compartidas de Flask."""

from __future__ import annotations

import time
from typing import Any

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


class TTLCache:
    """Cache en memoria con expiracion simple."""

    def __init__(self) -> None:
        self._store: dict[str, dict[str, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None

        if time.time() - entry["created_at"] >= entry["ttl"]:
            self._store.pop(key, None)
            return None

        return entry["value"]

    def set(self, key: str, value: Any, ttl: float) -> None:
        self._store[key] = {
            "value": value,
            "ttl": ttl,
            "created_at": time.time(),
        }

    def invalidate(self, key: str) -> None:
        self._store.pop(key, None)


db = SQLAlchemy()
migrate = Migrate()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
    default_limits=["200 per day", "50 per hour"],
)
cache = TTLCache()


def init_extensions(app) -> None:
    """Inicializa extensiones Flask sobre la app dada."""
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
