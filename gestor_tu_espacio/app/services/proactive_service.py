"""
Servicio de insights proactivos.
"""
from datetime import datetime, timedelta, timezone
from app.database import db, Event, Assignment, ChatHistory
from app.config import logger


# Palabras clave para detectar prioridad alta
HIGH_PRIORITY_KEYWORDS = ["examen", "entrega", "prueba", "presentación", "defensa", "final"]


def get_upcoming_events_prioritized(days: int = 3) -> list[dict]:
    """Obtiene eventos ordenados por prioridad."""
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)
    
    events = (
        Event.query
        .filter(Event.start_iso >= now.isoformat())
        .filter(Event.start_iso <= end.isoformat())
        .order_by(Event.start_iso)
        .all()
    )
    
    events_list = []
    for e in events:
        priority = calculate_priority(e)
        events_list.append({
            "event": e.to_dict(),
            "priority": priority,
            "hours_until": calculate_hours_until(e.start_iso)
        })
    
    events_list.sort(key=lambda x: x["hours_until"])
    return events_list


def calculate_priority(event_dict_or_obj) -> str:
    """Calcula prioridad basada en palabras clave y tiempo."""
    hours = calculate_hours_until(event_dict_or_obj.get("start_iso", ""))
    
    if hours < 24:
        return "high"
    elif hours < 72:
        return "medium"
    else:
        return "low"


def calculate_hours_until(start_iso: str) -> float:
    """Calcula horas hasta el evento."""
    try:
        event_time = datetime.fromisoformat(start_iso)
        now = datetime.now(timezone.utc)
        diff = event_time - now
        return diff.total_seconds() / 3600
    except:
        return 999


def get_pending_assignments() -> list[dict]:
    """Obtiene tareas pendientes."""
    now = datetime.now(timezone.utc).isoformat()
    
    assignments = (
        Assignment.query
        .filter(Assignment.due_iso >= now)
        .filter(Assignment.status != "completada")
        .order_by(Assignment.due_iso)
        .limit(10)
        .all()
    )
    
    return [a.to_dict() for a in assignments]


def get_recent_chat_history(limit: int = 3) -> list[dict]:
    """Obtiene historial reciente."""
    messages = (
        ChatHistory.query
        .order_by(ChatHistory.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [m.to_dict() for m in reversed(messages)]


def format_events_for_prompt(events: list[dict]) -> str:
    """Formatea eventos para el prompt."""
    if not events:
        return "No hay eventos próximos."
    
    lines = []
    for item in events:
        e = item["event"]
        priority = item["priority"]
        hours = item["hours_until"]
        
        badge = "🔴" if priority == "high" else ("🟡" if priority == "medium" else "🟢")
        
        date = e.get("start_iso", "")[:10]
        time = e.get("start_iso", "")[11:16]
        title = e.get("title", "Sin título")
        
        lines.append(f"{badge} {date} {time} - {title} (en {hours:.0f}h)")
    
    return "\n".join(lines)


def format_assignments_for_prompt(assignments: list[dict]) -> str:
    """Formatea tareas para el prompt."""
    if not assignments:
        return "No hay tareas pendientes."
    
    lines = []
    for a in assignments:
        course = a.get("course", "")
        title = a.get("title", "")
        due = a.get("due_iso", "")[:10]
        status = a.get("status", "pendiente")
        
        lines.append(f"- {course}: {title} (Vence: {due}, {status})")
    
    return "\n".join(lines)


async def generate_proactive_insights(ai_manager) -> list[str]:
    """Genera insights proactivos usando IA."""
    events = get_upcoming_events_prioritized(days=3)
    assignments = get_pending_assignments()
    chat_history = get_recent_chat_history()
    
    events_text = format_events_for_prompt(events)
    assignments_text = format_assignments_for_prompt(assignments)
    
    history_summary = ""
    if chat_history:
        history_summary = "Preguntas recientes del usuario: " + ", ".join([
            m["user_message"][:50] + "..." if len(m["user_message"]) > 50 else m["user_message"]
            for m in chat_history[-3:]
        ])
    
    prompt = f"""Eres un asistente personal PROACTIVO. No esperes a que el usuario pregunte - sugieres acciones.

=== EVENTOS PRÓXIMOS (próximas 72h) ===
{events_text}

=== TAREAS PENDIENTES ===
{assignments_text}

=== histoRIAL RECIENTE ===
{history_summary}

=== INSTRUCCIONES ===
Analiza los datos y genera 2-4 recomendaciones específicas y accionables.
- Prioriza eventos de alta prioridad (🔴)
- Considera fechas de entrega cercanas
- Sé concreto: qué hacer, cuándo y cómo
- No repetitions información conocida

Responde en español, en formato de lista numerada.
Cada recomendación debe ser una sola línea clara.
Ejemplo:
1. Estudia matemáticas hoy (examen mañana)
2. Envía el proyecto antes del viernes"""

    try:
        result = await ai_manager.generate(prompt)
        insights = result if isinstance(result, str) else str(result)
        
        lines = [l.strip() for l in insights.split("\n") if l.strip()]
        numbered = [l for l in lines if l and (l[0].isdigit() or l.startswith("-") or l.startswith("•"))]
        
        return numbered if numbered else ["No hay recomendaciones en este momento."]
    except Exception as e:
        logger.error(f"Error generando insights: {e}")
        return ["No se pudieron generar recomendaciones."]