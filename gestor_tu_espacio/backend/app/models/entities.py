"""Modelos SQLAlchemy del dominio."""

from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(500), nullable=False)
    start_iso = db.Column(db.String(50), nullable=False, index=True)
    end_iso = db.Column(db.String(50), nullable=True)
    all_day = db.Column(db.Integer, default=1)
    color = db.Column(db.String(50), default="teal")
    notes = db.Column(db.Text, default="")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "start_iso": self.start_iso,
            "end_iso": self.end_iso,
            "all_day": self.all_day,
            "color": self.color,
            "notes": self.notes,
        }


class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(500), nullable=False, index=True)
    email = db.Column(db.String(500), default="")
    phone = db.Column(db.String(500), default="")
    company = db.Column(db.String(500), default="")
    notes = db.Column(db.Text, default="")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "notes": self.notes,
        }


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    due_iso = db.Column(db.String(50), nullable=False, index=True)
    status = db.Column(db.String(50), default="pendiente")
    weight = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text, default="")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "course": self.course,
            "title": self.title,
            "due_iso": self.due_iso,
            "status": self.status,
            "weight": self.weight,
            "notes": self.notes,
        }


class ChatHistory(db.Model):
    __tablename__ = "chat_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50), default="general")
    timestamp = db.Column(
        db.String(50),
        default=lambda: datetime.now(timezone.utc).isoformat(),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_message": self.user_message,
            "ai_response": self.ai_response,
            "intent": self.intent,
            "timestamp": self.timestamp,
        }
