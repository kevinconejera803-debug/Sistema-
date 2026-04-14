"""Servicio de insights proactivos sin proveedores externos."""

from __future__ import annotations

from app.services.calendar_service import check_upcoming_24h, get_upcoming_events
from app.services.chat_service import get_last_messages
from app.services.university_service import get_upcoming_assignments


def generate_proactive_insights() -> list[str]:
    """Genera recomendaciones simples a partir de eventos, tareas e historial."""
    insights: list[str] = []
    urgent_events = check_upcoming_24h()
    assignments = get_upcoming_assignments(limit=3)
    history = get_last_messages(limit=2)

    if urgent_events:
        next_event = urgent_events[0]
        when = next_event.get("start_iso", "")[:16].replace("T", " ")
        insights.append(f"- Prepara {next_event.get('title', 'tu evento')} antes de {when}.")

    if assignments:
        next_assignment = assignments[0]
        due = next_assignment.get("due_iso", "")[:16].replace("T", " ")
        insights.append(
            f"- Avanza hoy en {next_assignment.get('title', 'la proxima tarea')} de "
            f"{next_assignment.get('course', 'tu curso')} porque vence {due}."
        )

    if history:
        last_question = history[-1].get("user_message", "").strip()
        if last_question:
            insights.append(f"- Tu ultima consulta fue sobre '{last_question[:40]}'; conviene convertirla en una accion concreta.")

    if not insights:
        upcoming = get_upcoming_events(days=7, limit=1)
        if upcoming:
            event = upcoming[0]
            when = event.get("start_iso", "")[:16].replace("T", " ")
            insights.append(f"- Tienes espacio para planificar la semana. Empieza por {event.get('title', 'tu siguiente evento')} ({when}).")
        else:
            insights.append("- No hay alertas inmediatas. Es un buen momento para ordenar pendientes y cargar nuevos eventos.")

    return insights[:3]
