"""Shim de compatibilidad para la capa de datos historica."""

from app.extensions import db, migrate
from app.models import Assignment, ChatHistory, Contact, Event
from app.services.bootstrap_service import initialize_database as init_db

__all__ = [
    "Assignment",
    "ChatHistory",
    "Contact",
    "Event",
    "db",
    "init_db",
    "migrate",
]
