"""Servicio de chat con memoria conversacional."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.config import logger
from app.database import ChatHistory, db

if TYPE_CHECKING:
    from app.services.calendar_service import get_user_context as calendar_context
    from app.services.university_service import (
        format_assignments_as_text,
        get_upcoming_assignments,
    )


def save_message(user_message: str, ai_response: str, intent: str = "general") -> None:
    """Guarda un mensaje en el historial."""
    try:
        entry = ChatHistory(
            user_message=user_message,
            ai_response=ai_response,
            intent=intent,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        logger.error("Error guardando mensaje: %s", error)


def get_last_messages(limit: int = 5) -> list[dict]:
    """Obtiene los ultimos mensajes del historial."""
    try:
        messages = ChatHistory.query.order_by(ChatHistory.timestamp.desc()).limit(limit).all()
        return list(reversed([message.to_dict() for message in messages]))
    except Exception as error:
        db.session.rollback()
        logger.error("Error obteniendo mensajes: %s", error)
        return []


def format_conversation_as_text(messages: list[dict]) -> str:
    """Formatea mensajes como conversacion legible."""
    if not messages:
        return "No hay historial previo."

    lines = []
    for message in messages:
        lines.append(f"Usuario: {message['user_message']}")
        lines.append(f"Sistema: {message['ai_response']}")
        lines.append("")

    return "\n".join(lines)


def get_chat_timeline(limit: int = 5) -> list[dict]:
    """Convierte el historial persistido en una linea de tiempo de chat."""
    timeline: list[dict] = []

    for message in get_last_messages(limit=limit):
        timeline.append(
            {
                "id": f"user-{message['id']}",
                "role": "user",
                "content": message["user_message"],
                "intent": message["intent"],
                "timestamp": message["timestamp"],
            }
        )
        timeline.append(
            {
                "id": f"assistant-{message['id']}",
                "role": "assistant",
                "content": message["ai_response"],
                "intent": message["intent"],
                "timestamp": message["timestamp"],
            }
        )

    return timeline


INTENT_KEYWORDS: dict[str, list[str]] = {
    "calendar": ["hoy", "manana", "agenda", "evento", "eventos", "calendario", "reunion", "cita", "fecha"],
    "university": ["estudiar", "tarea", "examen", "entrega", "curso", "asignatura", "universidad", "deber", "prueba"],
    "markets": ["mercado", "bolsa", "accion", "acciones", "inversion", "cripto", "bitcoin", "trading"],
    "news": ["noticia", "news", "ultima", "que paso", "actualidad"],
    "contacts": ["contacto", "contactos", "correo", "telefono", "empresa", "email"],
}


def detect_intent(question: str) -> str:
    """Detecta intencion del usuario basandose en palabras clave."""
    normalized_question = question.lower()

    for intent, keywords in INTENT_KEYWORDS.items():
        if any(keyword in normalized_question for keyword in keywords):
            return intent

    return "general"


def get_context_by_intent(intent: str) -> str:
    """Obtiene contexto adicional segun la intencion."""
    if intent == "calendar":
        from app.services.calendar_service import get_user_context

        return get_user_context()

    if intent == "university":
        from app.services.university_service import format_assignments_as_text, get_upcoming_assignments

        return format_assignments_as_text(get_upcoming_assignments(limit=10))

    return ""