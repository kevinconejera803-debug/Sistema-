"""
MockAIProvider: Proveedor simulado para testing y desarrollo.
Simula respuestas sin usar ningún modelo real.
"""
import asyncio
import time
import random
from typing import Optional
from app.ai import AIProvider, AIResponse

class MockAIProvider(AIProvider):
    """
    Proveedor mock que genera respuestas predefinidas o aleatorias.
    Útil para desarrollo, testing y демо sin costo de API.
    """
    
    def __init__(self, config: dict = None):
        super().__init__(config)
        self.model_name = config.get("model", "mock") if config else "mock"
        self._setup_responses()
    
    def _setup_responses(self):
        """Respuestas predefinidas por categoría."""
        self._responses = {
            "saludo": [
                "¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte?",
                "¡Buenos días! ¿Qué necesitas saber?",
                "¡Bienvenido! ¿Tienes alguna pregunta?"
            ],
            "ayuda": [
                "Puedo ayudarte con información sobre tecnología, ciencia, historia y más.",
                "Estoy diseñado para responder preguntas sobre diversos temas. Solo pregúntame.",
                "Tengo conocimientos sobre una amplia variedad de temas. ¿Qué te interesa?"
            ],
            "default": [
                "Entiendo tu pregunta. ¿Podrías ser más específico?",
                "Interesante. ¿Qué aspecto te gustaría explorar más?",
                "Gracias por tu pregunta. Déjame pensar en la mejor respuesta."
            ]
        }
    
    async def generate(self, prompt: str, **kwargs) -> AIResponse:
        """Simula generación de respuesta."""
        start_time = time.time()
        
        # Obtener configuración
        temperature = kwargs.get("temperature", 0.7)
        max_tokens = kwargs.get("max_tokens", 500)
        
        # Seleccionar respuesta basada en keywords
        prompt_lower = prompt.lower()
        response_text = self._select_response(prompt_lower)
        
        # Simular latencia async (100-500ms)
        await asyncio.sleep(random.uniform(0.1, 0.5))
        
        latency = int((time.time() - start_time) * 1000)
        
        return AIResponse(
            content=response_text,
            model=self.model_name,
            usage={
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response_text.split()),
                "total_tokens": len(prompt.split()) + len(response_text.split())
            },
            latency_ms=latency
        )
    
    async def embed(self, text: str) -> list[float]:
        """Simula embeddings con vector aleatorio (dimension 384). Sin dependencias externas."""
        return [random.gauss(0, 1) for _ in range(384)]
    
    def _select_response(self, prompt: str) -> str:
        """Selecciona respuesta apropiada basada en el prompt."""
        # Keywords para categorías
        keywords = {
            "saludo": ["hola", "buenos", "buenas", "saludos", "hello", "hi"],
            "ayuda": ["ayuda", "puedes", "qué puedes", "qué haces", "capacidades"]
        }
        
        for category, words in keywords.items():
            if any(word in prompt for word in words):
                return random.choice(self._responses[category])
        
        return random.choice(self._responses["default"])
    
    def is_available(self) -> bool:
        """Mock siempre disponible."""
        return True


# Instancia global para uso simple
_default_mock = MockAIProvider()

def get_mock_provider() -> MockAIProvider:
    """Retorna la instancia por defecto del mock provider."""
    return _default_mock