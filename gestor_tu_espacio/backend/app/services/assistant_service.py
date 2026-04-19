"""Respuestas locales del asistente sin proveedores externos."""

from __future__ import annotations

from app.models import Contact
from app.services.calendar_service import get_today_events, get_upcoming_events
from app.services.chat_service import detect_intent, save_message
from app.services.external_data_service import fetch_external_data, get_sources_list
from app.services.markets_service import analyze_market_data, fetch_markets
from app.services.news_service import fetch_news, summarize_news_items
from app.services.university_service import build_task_suggestions, get_upcoming_assignments

_GREETINGS = {
    "hola",
    "buenas",
    "buenas tardes",
    "buenos dias",
    "hi",
    "hello",
    "hey",
}


def _is_greeting(question: str) -> bool:
    normalized = question.strip().lower()
    return normalized in _GREETINGS or normalized.startswith(("hola", "buenas", "hello", "hi", "hey"))


def _build_calendar_answer(question: str) -> str:
    normalized = question.lower()
    if "hoy" in normalized:
        events = get_today_events()
        if not events:
            return "Hoy no tienes eventos cargados en el calendario."

        labels = [f"{event['title']} a las {event['start_iso'][11:16]}" for event in events[:3]]
        return "Hoy tienes: " + "; ".join(labels) + "."

    events = get_upcoming_events(days=7, limit=3)
    if not events:
        return "No tienes eventos proximos en los siguientes 7 dias."

    labels = [f"{event['title']} ({event['start_iso'][:16].replace('T', ' ')})" for event in events]
    return "Tus proximos eventos son: " + "; ".join(labels) + "."


def _build_university_answer() -> str:
    assignments = get_upcoming_assignments(limit=3)
    if not assignments:
        return "No tienes tareas pendientes registradas."

    preview = "; ".join(
        f"{assignment['title']} de {assignment['course']} ({assignment['due_iso'][:16].replace('T', ' ')})"
        for assignment in assignments
    )
    suggestion = build_task_suggestions(assignments)
    return f"Tareas proximas: {preview}. {suggestion}"


def _build_contacts_answer() -> str:
    contacts = Contact.query.order_by(Contact.name).limit(3).all()
    if not contacts:
        return "No tienes contactos guardados todavia."

    labels = []
    for contact in contacts:
        detail = contact.company or contact.email or contact.phone or "sin detalle"
        labels.append(f"{contact.name} ({detail})")
    return "Contactos disponibles: " + "; ".join(labels) + "."


def _build_general_answer() -> str:
    events = get_upcoming_events(days=3, limit=1)
    assignments = get_upcoming_assignments(limit=1)

    parts = []
    if events:
        event = events[0]
        parts.append(f"Tu siguiente evento es {event['title']} ({event['start_iso'][:16].replace('T', ' ')}).")
    if assignments:
        assignment = assignments[0]
        parts.append(
            f"La entrega mas cercana es {assignment['title']} de {assignment['course']} "
            f"({assignment['due_iso'][:16].replace('T', ' ')})."
        )

    if not parts:
        return "No encontre eventos ni tareas cercanas. Puedes preguntarme por calendario, tareas, noticias o mercados."

    parts.append("Si quieres, te respondo algo mas puntual sobre calendario, tareas, noticias o mercados.")
    return " ".join(parts)


def answer_question(question: str) -> dict:
    """Responde con reglas locales y datos del sistema."""
    cleaned_question = question.strip()
    if not cleaned_question:
        return {
            "answer": "Debes proporcionar una pregunta.",
            "provider": "system",
            "intent": "general",
            "data_type": "none",
            "sources": "",
            "context_used": False,
        }

    if _is_greeting(cleaned_question):
        answer = "Hola. Puedo ayudarte con tu calendario, tareas, noticias y mercados usando los datos del sistema."
        save_message(cleaned_question, answer, "general")
        return {
            "answer": answer,
            "provider": "system",
            "intent": "general",
            "data_type": "none",
            "sources": "",
            "context_used": False,
        }

    intent = detect_intent(cleaned_question)
    external_data, data_type = fetch_external_data(cleaned_question)
    sources = get_sources_list(external_data)

    if intent == "news" or data_type == "noticias":
        answer = summarize_news_items(external_data or fetch_news())
    elif intent == "markets" or data_type == "economia":
        answer = analyze_market_data(external_data or fetch_markets())
    elif intent == "calendar":
        answer = _build_calendar_answer(cleaned_question)
    elif intent == "university":
        answer = _build_university_answer()
    elif intent == "contacts":
        answer = _build_contacts_answer()
    else:
        answer = _build_general_answer()

    save_message(cleaned_question, answer, intent)
    return {
        "answer": answer,
        "provider": "system",
        "intent": intent,
        "data_type": data_type,
        "sources": sources,
        "context_used": intent != "general" or bool(external_data),
    }
