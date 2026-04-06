"""
Servicio de chat con memoria conversacional.
"""
from app.database import db, ChatHistory
from app.config import logger


def save_message(user_message: str, ai_response: str, intent: str = "general") -> None:
    """Guarda un mensaje en el historial."""
    try:
        entry = ChatHistory(
            user_message=user_message,
            ai_response=ai_response,
            intent=intent
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        logger.error(f"Error guardando mensaje: {e}")


def get_last_messages(limit: int = 5) -> list[dict]:
    """Obtiene últimos mensajes del historial."""
    try:
        messages = (
            ChatHistory.query
            .order_by(ChatHistory.timestamp.desc())
            .limit(limit)
            .all()
        )
        result = [m.to_dict() for m in messages]
        return list(reversed(result))
    except Exception as e:
        logger.error(f"Error obteniendo mensajes: {e}")
        return []


def format_conversation_as_text(messages: list[dict]) -> str:
    """Formatea mensajes como conversación."""
    if not messages:
        return "No hay historial previo."
    
    lines = []
    for m in messages:
        lines.append(f"Usuario: {m['user_message']}")
        lines.append(f"IA: {m['ai_response']}")
        lines.append("")
    
    return "\n".join(lines)


# Palabras clave para detectar intención
INTENT_KEYWORDS = {
    "calendar": ["hoy", "mañana", "agenda", "evento", "eventos", "calendario", "reunión", "cita", "fecha"],
    "university": ["estudiar", "tarea", "examen", "entrega", "curso", "asignatura", "universidad", "deber", "prueba"],
    "markets": ["mercado", "bolsa", "acción", "acciones", "inversión", "cripto", "bitcoin", "trading"],
    "news": ["noticia", "news", "última", "qué pasó", "qué pasó", "actualidad"],
}


def detect_intent(question: str) -> str:
    """Detecta intención del usuario basándose en palabras clave."""
    question_lower = question.lower()
    
    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in question_lower:
                return intent
    
    return "general"


def get_context_by_intent(intent: str) -> str:
    """Obtiene contexto adicional según intención."""
    if intent == "calendar":
        from app.services.calendar_service import get_user_context
        return get_user_context()
    elif intent == "university":
        from app.services.university_service import get_upcoming_assignments, format_events_as_text
        # Note: reusing format_events_as_text from calendar for simplicity
        from app.services.calendar_service import format_events_as_text
        assignments = get_upcoming_assignments(limit=10)
        return format_events_as_text(assignments) if assignments else "No hay tareas pendientes."
    else:
        return ""