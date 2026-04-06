"""
SQLAlchemy — Tu espacio: eventos (calendario), contactos, entregas (universidad).

Esquema:
  - events: Calendario con eventos de día completo y horarios.
  - contacts: CRM de contactos.
  - assignments: Tareas y entregas universitarias.
"""
from __future__ import annotations

import os
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.config import logger

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "tu_espacio.db"

db = SQLAlchemy()
migrate = Migrate()

def get_db_path() -> Path | str:
    """Resuelve la ruta de la BD, permitiendo override por entorno."""
    raw_path = (os.environ.get("TU_ESPACIO_DB_PATH") or "").strip()
    if not raw_path:
        return DEFAULT_DB_PATH
    if raw_path == ":memory:":
        return raw_path

    db_path = Path(raw_path).expanduser()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return db_path

def should_seed_demo() -> bool:
    """Determina si se cargan datos demo en la inicialización."""
    raw_value = (os.environ.get("TU_ESPACIO_SEED_DEMO") or "1").strip().lower()
    return raw_value in {"1", "true", "yes", "on"}

def init_db(app) -> None:
    """Inicializa esquema de BD y datos de demostración usando SQLAlchemy."""
    db_path_str = str(get_db_path())
    if db_path_str == ":memory:":
        app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///:memory:"
    else:
        # uri absoluta para sqlite en SQLAlchemy 2.0/3.0
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path_str}"
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    if 'sqlalchemy' not in app.extensions:
        db.init_app(app)
        migrate.init_app(app, db)
    
    # Dentro del contexto de app creamos todo e insertamos demo si es la primera vez
    with app.app_context():
        try:
            db.create_all()
            logger.info("Esquema BD inicializado vía SQLAlchemy")
            if should_seed_demo():
                _seed_demo()
        except Exception as e:
            logger.error(f"Error inicializando BD: {e}", exc_info=True)


class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(500), nullable=False)
    start_iso = db.Column(db.String(50), nullable=False, index=True)
    end_iso = db.Column(db.String(50), nullable=True)
    all_day = db.Column(db.Integer, default=1)
    color = db.Column(db.String(50), default='teal')
    notes = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "start_iso": self.start_iso,
            "end_iso": self.end_iso,
            "all_day": self.all_day,
            "color": self.color,
            "notes": self.notes
        }


class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(500), nullable=False, index=True)
    email = db.Column(db.String(500), default='')
    phone = db.Column(db.String(500), default='')
    company = db.Column(db.String(500), default='')
    notes = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "notes": self.notes
        }


class Assignment(db.Model):
    __tablename__ = 'assignments'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    due_iso = db.Column(db.String(50), nullable=False, index=True)
    status = db.Column(db.String(50), default='pendiente')
    weight = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            "id": self.id,
            "course": self.course,
            "title": self.title,
            "due_iso": self.due_iso,
            "status": self.status,
            "weight": self.weight,
            "notes": self.notes
        }


class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50), default='general')
    timestamp = db.Column(db.String(50), default=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "user_message": self.user_message,
            "ai_response": self.ai_response,
            "intent": self.intent,
            "timestamp": self.timestamp
        }


def _seed_demo() -> None:
    """Carga datos de demostración si la BD está vacía."""
    if Event.query.count() > 0:
        logger.debug("BD ya tiene datos, omitiendo seed")
        return
    
    today = date.today()
    
    # Eventos demo
    e1 = Event(
        title="Revisión semanal",
        start_iso=datetime.combine(today, time(9, 0)).isoformat(),
        end_iso=None,
        all_day=1,
        color="teal",
        notes="Bloque de enfoque"
    )
    e2 = Event(
        title="Entrega borrador",
        start_iso=datetime.combine(today + timedelta(days=3), time(23, 59)).isoformat(),
        end_iso=None,
        all_day=1,
        color="yellow",
        notes="Universidad"
    )
    db.session.add_all([e1, e2])
    logger.info("Insertados 2 eventos demo")
    
    # Contactos demo
    if Contact.query.count() == 0:
        c1 = Contact(
            name="María López",
            email="maria@ejemplo.com",
            phone="+34 600 000 000",
            company="Consultora",
            notes="Contacto demo"
        )
        db.session.add(c1)
        logger.info("Insertado contacto demo")
    
    # Tareas demo
    if Assignment.query.count() == 0:
        due_d = today + timedelta(days=7)
        due = datetime.combine(due_d, time(12, 0)).isoformat()
        a1 = Assignment(
            course="Data & analítica",
            title="Informe de segmentación",
            due_iso=due,
            status="pendiente",
            weight=30,
            notes="Proyecto final"
        )
        db.session.add(a1)
        logger.info("Insertada tarea demo")

    db.session.commit()
