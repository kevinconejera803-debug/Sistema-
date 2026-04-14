"""Servicios de observabilidad del sistema."""

from __future__ import annotations

from app.models import Assignment, Contact, Event


def get_database_stats() -> dict:
    events = Event.query.count()
    contacts = Contact.query.count()
    assignments = Assignment.query.count()

    return {
        "events": events,
        "contacts": contacts,
        "assignments": assignments,
        "total": events + contacts + assignments,
    }
