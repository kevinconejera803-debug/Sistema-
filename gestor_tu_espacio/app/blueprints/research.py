"""
Blueprint de Investigación - Refactorizado para usar AI Layer.
Endpoints para chat y búsqueda usando el sistema de IA.
"""
from __future__ import annotations

import asyncio
from flask import Blueprint, jsonify, request
from app.utils import log_endpoint
from app.config import logger

# AI Layer
from app.ai.core.manager import get_ai_manager

research_bp = Blueprint("research", __name__, url_prefix="/api")


@research_bp.route("/ai/ask", methods=["GET"])
@log_endpoint
def api_ai_chat():
    """
    Endpoint de chat con IA.
    Usa el AI Manager para generar respuestas.
    """
    question = request.args.get("q", "").strip()
    if not question:
        return jsonify({"error": "Debes proporcionar una pregunta."}), 400
    
    # Usar el AI Manager
    ai_manager = get_ai_manager()
    
    # Opciones adicionales del request
    options = {}
    if "temperature" in request.args:
        options["temperature"] = float(request.args.get("temperature"))
    if "max_tokens" in request.args:
        options["max_tokens"] = int(request.args.get("max_tokens"))
    
    # Generar respuesta usando async
    try:
        answer = asyncio.run(ai_manager.generate(question, **options))
        
        return jsonify({
            "question": question,
            "answer": answer,
            "provider": ai_manager.provider_name,
            "status": "ok"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Error generando respuesta: {str(e)}",
            "question": question
        }), 500


@research_bp.route("/ai/status", methods=["GET"])
@log_endpoint
def api_ai_status():
    """Estado del sistema de IA."""
    ai_manager = get_ai_manager()
    
    # Modelo real del provider activo
    active_model = ai_manager.provider.model_name if ai_manager.provider else ai_manager._config.get("model")
    
    return jsonify({
        "provider": ai_manager.provider_name,
        "model": active_model,
        "available": ai_manager.is_available(),
        "available_providers": ai_manager.get_available_providers(),
        "config": {
            "temperature": ai_manager._config.get("temperature"),
            "max_tokens": ai_manager._config.get("max_tokens"),
        }
    })


@research_bp.route("/ai/providers", methods=["GET"])
@log_endpoint
def api_ai_providers():
    """Lista de proveedores disponibles."""
    ai_manager = get_ai_manager()
    
    return jsonify({
        "current": ai_manager.provider_name,
        "available": ai_manager.get_available_providers(),
        "description": {
            "mock": "Proveedor simulado para testing y desarrollo",
            "ollama": "Modelos locales (requiere Ollama instalado)",
            "openai": "OpenAI GPT (requiere API key)",
            "anthropic": "Anthropic Claude (requiere API key)"
        }
    })


@research_bp.route("/ai/switch", methods=["POST"])
@log_endpoint
def api_ai_switch():
    """Cambiar proveedor de IA."""
    data = request.get_json() or {}
    provider_name = data.get("provider", "").strip()
    
    if not provider_name:
        return jsonify({"error": "Debes especificar un proveedor."}), 400
    
    ai_manager = get_ai_manager()
    success = ai_manager.set_provider(provider_name)
    
    if success:
        return jsonify({
            "status": "ok",
            "provider": ai_manager.provider_name,
            "message": f"Proveedor cambiado a {provider_name}"
        })
    else:
        return jsonify({
            "error": f"Proveedor '{provider_name}' no disponible",
            "available": ai_manager.get_available_providers()
        }), 400


# DEPRECATED - Mantenido por compatibilidad pero no funcional
# El endpoint /api/research que usaba _CORPUS ya no tiene sentido
# con la nueva arquitectura de IA.
# Se mantiene para no romper dependencias externas pero retorna warning.

@research_bp.route("/research")
@log_endpoint
def api_research_deprecated():
    """Deprecated: Use /ai/ask instead."""
    return jsonify({
        "error": "Este endpoint está deprecado. Usa /api/ai/ask para interacturar con IA.",
        "suggestion": "GET /api/ai/ask?q=tu_pregunta"
    }), 410


# ============================================================
# ENDPOINTS INTELIGENTES CON CONTEXTO
# ============================================================

# Saludos tratados directamente (sin IA)
GREETINGS = {"hola", "buenas", "buenas tardes", "buenas días", "hi", "hello", "hey", "qué tal", "como estas", "cómo estás"}

# Respuestas predefinidas para saludos
GREETING_RESPONSES = [
    "Hola 👋 ¿En qué puedo ayudarte hoy?",
    "¡Hola! ¿Qué necesitas?",
    "¡Hey! ¿En qué te veo?",  #
]


def _is_greeting(text: str) -> bool:
    """Detecta si es un saludo."""
    text_lower = text.lower().strip()
    return text_lower in GREETINGS or any(text_lower.startswith(g) for g in ["hola", "buenas", "hi", "hey", "que tal"])


def _clean_response(response: str) -> str:
    """Limpia respuestas malas."""
    bad_phrases = ["ollama", "no estoy familiarizado", "no puedo responder", "no tengo capacidad", "no fui entrenado"]
    response_lower = response.lower()
    
    for phrase in bad_phrases:
        if phrase in response_lower:
            return "No entendí bien tu pregunta. ¿Puedes reformularla?"
    
    return response


@research_bp.route("/research/ask", methods=["POST"])
@log_endpoint
def api_research_ask():
    """
    Endpoint de chat inteligente con contexto del usuario.
    Usa memoria conversacional y detección de intención.
    """
    data = request.get_json(force=True, silent=True) or {}
    question = data.get("question", "").strip()
    
    if not question:
        return jsonify({"error": "Debes proporcionar una pregunta."}), 400
    
    # Tratar saludos directamente
    if _is_greeting(question):
        import random
        response = random.choice(GREETING_RESPONSES)
        return jsonify({
            "question": question,
            "answer": response,
            "provider": "system",
            "context_used": False
        })
    
    from app.services.chat_service import (
        detect_intent, get_context_by_intent,
        get_last_messages, format_conversation_as_text,
        save_message
    )
    from app.services.calendar_service import get_user_context
    from app.services.external_data_service import fetch_external_data, format_external_data, get_sources_list, classify_question
    
    ai_manager = get_ai_manager()
    
    intent = detect_intent(question)
    conversation_history = get_last_messages(limit=3)
    history_text = format_conversation_as_text(conversation_history)
    user_context = get_user_context()
    extra_context = get_context_by_intent(intent)
    
    # Obtener datos externos si es tema actual
    external_data, data_type = fetch_external_data(question)
    external_text = format_external_data(external_data, data_type)
    sources_list = get_sources_list(external_data)
    
    has_external = bool(external_data)
    
    # Prompt con datos externos
    prompt = f"""Eres un asistente personal confiable.

REGLAS ESTRICTAS:
- NO inventar información
- SI hay datos reales → usarlos Y añadir fuentes
- SIEMPRE incluir enlaces de fuentes
- Si no hay datos → decir "No tengo información actualizada"

DATOS REALES DISPONIBLES:
{external_text}

TU CONTEXTO (calendario/tareas):
{user_context}

HISTORIAL:
{history_text}

PREGUNTA: {question}

Responde:
1. En español, máximo 3 líneas
2. SI hay datos → incluir fuentes
3. Usar datos reales, NO inventar"""

    try:
        answer = asyncio.run(ai_manager.generate(prompt))
        
        answer = _clean_response(answer)
        save_message(question, answer, intent)
        
        return jsonify({
            "question": question,
            "answer": answer,
            "provider": ai_manager.provider_name,
            "intent": intent,
            "data_type": data_type if has_external else "none",
            "sources": sources_list if has_external else "",
            "context_used": True
        })
        
    except Exception as e:
        logger.error(f"Error en research/ask: {e}")
        return jsonify({"error": str(e)}), 500


@research_bp.route("/research/suggestions", methods=["GET"])
@log_endpoint
def api_research_suggestions():
    """
    Sugerencias proactivas basadas en eventos próximos.
    """
    from app.services.calendar_service import get_upcoming_events, format_events_as_text
    
    ai_manager = get_ai_manager()
    events = get_upcoming_events(days=7)
    events_text = format_events_as_text(events) if events else "No hay eventos próximos."
    
    prompt = f"""Basándote en mi calendario, sugiere qué debería hacer para estar preparado:

{events_text}

Responde con sugerencias prácticas y específicas para hoy/semana."""

    try:
        suggestions = asyncio.run(ai_manager.generate(prompt))
        
        return jsonify({
            "suggestions": suggestions,
            "provider": ai_manager.provider_name
        })
        
    except Exception as e:
        logger.error(f"Error en suggestions: {e}")
        return jsonify({"error": str(e)}), 500


@research_bp.route("/research/notifications", methods=["GET"])
@log_endpoint
def api_research_notifications():
    """
    Notificaciones de eventos urgentes (próximas 24h).
    """
    from app.services.calendar_service import check_upcoming_24h, format_urgent_notifications
    
    events = check_upcoming_24h()
    notifications = format_urgent_notifications(events)
    
    return jsonify({
        "notifications": notifications,
        "count": len(events)
    })


# ============================================================
# ENDPOINTS PROACTIVOS
# ============================================================

@research_bp.route("/assistant/insights", methods=["GET"])
@log_endpoint
def api_assistant_insights():
    """
    Genera insights proactivos para el usuario.
    Sugiere acciones sin que el usuario pregunte.
    """
    from app.services.proactive_service import generate_proactive_insights
    
    ai_manager = get_ai_manager()
    
    try:
        insights = asyncio.run(generate_proactive_insights(ai_manager))
        
        return jsonify({
            "status": "ok",
            "insights": insights,
            "provider": ai_manager.provider_name
        })
        
    except Exception as e:
        logger.error(f"Error en insights: {e}")
        return jsonify({"error": str(e)}), 500