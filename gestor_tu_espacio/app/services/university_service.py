"""
Servicio de universidad con soporte de IA para planificación.
"""
from datetime import datetime, timezone
from app.database import db, Assignment
from app.config import logger


def get_upcoming_assignments(limit: int = 10) -> list[dict]:
    """Obtiene tareas próximas."""
    now = datetime.now(timezone.utc).isoformat()
    return [
        a.to_dict() for a in 
        Assignment.query
        .filter(Assignment.due_iso >= now)
        .filter(Assignment.status != "completada")
        .order_by(Assignment.due_iso)
        .limit(limit)
        .all()
    ]


def suggest_task_planning(assignments: list[dict]) -> str:
    """Genera prompt para sugerencia de planificación."""
    if not assignments:
        return "No hay tareas pendientes."
    
    tasks = "\n".join([
        f"- {a['title']} ({a['course']}) - Vence: {a['due_iso'][:10]} - Peso: {a['weight']}%"
        for a in assignments[:8]
    )
    
    prompt = f"""Estas son mis tareas pendientes. Sugiere cómo priorizarlas y un plan de estudio:

{tasks}

Sugerencia:"""
    return prompt


async def generate_task_suggestions(ai_manager) -> str:
    """Genera sugerencias de planificación usando IA."""
    from app.services.university_service import get_upcoming_assignments
    
    assignments = get_upcoming_assignments()
    if not assignments:
        return "No hay tareas pendientes."
    
    prompt = suggest_task_planning(assignments)
    
    try:
        suggestions = await ai_manager.generate(prompt)
        return suggestions if isinstance(suggestions, str) else str(suggestions)
    except Exception as e:
        logger.error(f"Error generando sugerencias: {e}")
        return "No se pudieron generar sugerencias."