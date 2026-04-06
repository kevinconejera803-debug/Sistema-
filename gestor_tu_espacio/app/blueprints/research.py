"""
Blueprint de Investigación - Refactorizado para usar AI Layer.
Endpoints para chat y búsqueda usando el sistema de IA.
"""
from __future__ import annotations

import asyncio
from flask import Blueprint, jsonify, request
from app.utils import log_endpoint

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
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            answer = loop.run_until_complete(
                ai_manager.generate(question, **options)
            )
        finally:
            loop.close()
        
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
    
    return jsonify({
        "provider": ai_manager.provider_name,
        "available": ai_manager.is_available(),
        "available_providers": ai_manager.get_available_providers(),
        "config": {
            "model": ai_manager._config.get("model"),
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