"""Inicializacion de base de datos y datos demo."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta

from app.config import logger
from app.extensions import db
from app.models import Assignment, Contact, Event


def initialize_database(app) -> None:
    """Crea tablas y carga demo si corresponde."""
    with app.app_context():
        db.create_all()
        logger.info("Esquema de base de datos inicializado")
        if app.config.get("SEED_DEMO", False):
            seed_demo_data()


def seed_demo_data() -> None:
    """Inserta datos de demostracion una sola vez."""
    if Event.query.count() > 0:
        logger.debug("La base de datos ya contiene datos; se omite el seed")
        return

    today = date.today()

    demo_events = [
        Event(
            title="Revision semanal",
            start_iso=datetime.combine(today, time(9, 0)).isoformat(),
            end_iso=None,
            all_day=1,
            color="teal",
            notes="Bloque de enfoque",
        ),
        Event(
            title="Entrega borrador",
            start_iso=datetime.combine(today + timedelta(days=3), time(23, 59)).isoformat(),
            end_iso=None,
            all_day=1,
            color="yellow",
            notes="Universidad",
        ),
    ]
    db.session.add_all(demo_events)

    if Contact.query.count() == 0:
        db.session.add(
            Contact(
                name="Maria Lopez",
                email="maria@ejemplo.com",
                phone="+34 600 000 000",
                company="Consultora",
                notes="Contacto demo",
            )
        )

    if Assignment.query.count() == 0:
        db.session.add(
            Assignment(
                course="Data & analitica",
                title="Informe de segmentacion",
                due_iso=datetime.combine(today + timedelta(days=7), time(12, 0)).isoformat(),
                status="pendiente",
                weight=30,
                notes="Proyecto final",
            )
        )

    db.session.commit()
    logger.info("Datos demo cargados")
