"""Punto de entrada del paquete Flask."""

from app.extensions import cache, db, limiter, migrate
from app.factory import create_app

app = create_app()

__all__ = ["app", "cache", "create_app", "db", "limiter", "migrate"]
