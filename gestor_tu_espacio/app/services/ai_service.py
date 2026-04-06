"""
Servicio de AI/ML para respuestas inteligentes.
"""
import os
import json
import requests
from app.config import logger, AI_PROVIDER, AI_API_KEY, AI_MODEL, AI_MAX_TOKENS, AI_TEMPERATURE, AI_TIMEOUT

def _call_openai(prompt: str, system_message: str = "Eres un asistente útil.") -> str:
    """Llamar a OpenAI/OpenRouter API."""
    if not AI_API_KEY:
        return "⚠️ API key no configurada. Configura AI_API_KEY en .env"
    
    if AI_PROVIDER == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Tu Espacio"
        }
    else:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json"
        }
    
    data = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": AI_MAX_TOKENS,
        "temperature": AI_TEMPERATURE
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=AI_TIMEOUT)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.exceptions.Timeout:
        logger.error("OpenAI timeout")
        return "⏱️ Tiempo de espera agotado. Intenta de nuevo."
    except requests.exceptions.HTTPError as e:
        logger.error(f"OpenAI HTTP error: {e}")
        return f"❌ Error: {e.response.status_code}"
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        return f"❌ Error: {str(e)}"

def _call_anthropic(prompt: str, system_message: str = "Eres un asistente útil.") -> str:
    """Llamar a Anthropic API."""
    if not AI_API_KEY:
        return "⚠️ API key no configurada. Configura AI_API_KEY en .env"
    
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": AI_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    data = {
        "model": AI_MODEL,
        "max_tokens": AI_MAX_TOKENS,
        "system": system_message,
        "messages": [{"role": "user", "content": prompt}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=AI_TIMEOUT)
        response.raise_for_status()
        result = response.json()
        return result["content"][0]["text"]
    except Exception as e:
        logger.error(f"Anthropic error: {e}")
        return f"❌ Error: {str(e)}"

def answer_with_ai(prompt: str, context: str = "") -> str:
    """Responder usando AI basada en el contexto del sistema."""
    system = """Eres el asistente de "Tu Espacio", una aplicación de gestión personal. 
Respondes de manera clara, concisa y útil. Puedes ayudar con:
- Preguntas sobre ciberseguridad y mejores prácticas
- Explicaciones de conceptos de Machine Learning
- Recomendaciones generales de productividad
- Información sobre los módulos de la app

Si no sabes algo, admite tu ignorancia honestamente."""

    full_prompt = prompt
    if context:
        full_prompt = f"Contexto: {context}\n\nPregunta: {prompt}"
    
    if AI_PROVIDER == "anthropic":
        return _call_anthropic(full_prompt, system)
    else:
        return _call_openai(full_prompt, system)

def answer_research(prompt: str) -> str:
    """Responder preguntas de investigación usando AI."""
    system = """Eres un asistente de investigación académica. Proporcionas respuestas 
basadas en evidencia, referencias a fuentes confiables, y explicas conceptos técnicos 
de manera clara. Citas fuentes cuando es posible."""

    return _call_openai(prompt, system)