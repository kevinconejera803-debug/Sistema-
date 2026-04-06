"""
AIManager: Gestor central de proveedores de IA.
Administra la selección, fallback y configuración de modelos.
"""
import os
from typing import Optional
from app.config import logger
from app.ai import AIProvider
from app.ai.adapters.mock_provider import MockAIProvider, get_mock_provider

# Proveedores disponibles
_PROVIDERS = {
    "mock": MockAIProvider,
    "ollama": None,  # Se carga dinámicamente para evitar errors si no está instalado
    # "openai": None,  # Pendiente
    # "anthropic": None,  # Pendiente
}

class AIManager:
    """
    Gestor central de IA.
    Maneja la selección de proveedor, configuración y fallback.
    """
    
    def __init__(self):
        self._current_provider: Optional[AIProvider] = None
        self._provider_name = "mock"  # Default
        self._config = self._load_config()
        self._initialize_provider()
    
    def _load_config(self) -> dict:
        """Carga configuración desde variables de entorno."""
        return {
            "provider": os.environ.get("AI_PROVIDER", "mock"),
            "model": os.environ.get("AI_MODEL", "mock"),
            "temperature": float(os.environ.get("AI_TEMPERATURE", "0.7")),
            "max_tokens": int(os.environ.get("AI_MAX_TOKENS", "500")),
            "timeout": int(os.environ.get("AI_TIMEOUT", "30")),
            # Ollama específico
            "ollama_url": os.environ.get("OLLAMA_URL", "http://localhost:11434"),
            "ollama_model": os.environ.get("OLLAMA_MODEL", "llama3"),
        }
    
    def _initialize_provider(self):
        """Inicializa el proveedor configurado."""
        provider_name = self._config["provider"].lower()
        
        # Cargar dinámicamente Ollama si se solicita
        if provider_name == "ollama" and _PROVIDERS.get("ollama") is None:
            try:
                from app.ai.adapters.ollama_provider import OllamaProvider
                _PROVIDERS["ollama"] = OllamaProvider
                logger.info("Ollama provider loaded successfully")
            except ImportError as e:
                logger.warning(f"No se pudo cargar Ollama: {e}. Usando mock.")
                provider_name = "mock"
        
        if provider_name not in _PROVIDERS:
            logger.warning(f"Proveedor '{provider_name}' no reconocido, usando mock")
            provider_name = "mock"
        
        provider_class = _PROVIDERS[provider_name]
        if provider_class is None:
            logger.warning(f"Proveedor '{provider_name}' no cargado, usando mock")
            provider_name = "mock"
            provider_class = _PROVIDERS["mock"]
        
        self._current_provider = provider_class(self._config)
        self._provider_name = provider_name
        logger.info(f"AI Manager inicializado con proveedor: {provider_name}")
    
    @property
    def provider(self) -> AIProvider:
        """Retorna el proveedor actual."""
        return self._current_provider
    
    @property
    def provider_name(self) -> str:
        """Retorna el nombre del proveedor actual."""
        return self._provider_name
    
    def is_available(self) -> bool:
        """Verifica si el proveedor actual está disponible."""
        if self._current_provider:
            return self._current_provider.is_available()
        return False
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """
        Genera respuesta usando el proveedor configurado.
        Wrapper simple que retorna solo el contenido.
        """
        if not self._current_provider:
            return "Error: Proveedor de IA no disponible"
        
        # Merge kwargs con config
        options = {
            "temperature": kwargs.get("temperature", self._config["temperature"]),
            "max_tokens": kwargs.get("max_tokens", self._config["max_tokens"]),
        }
        
        try:
            response = await self._current_provider.generate(prompt, **options)
            return response.content
        except Exception as e:
            logger.error(f"Error generando respuesta: {e}")
            return f"Error al generar respuesta: {str(e)}"
    
    def set_provider(self, provider_name: str) -> bool:
        """
        Cambia el proveedor de IA en tiempo de ejecución.
        Útil para testing o switching entre modelos.
        """
        if provider_name not in _PROVIDERS:
            logger.error(f"Proveedor '{provider_name}' no disponible")
            return False
        
        provider_class = _PROVIDERS[provider_name]
        self._current_provider = provider_class(self._config)
        self._provider_name = provider_name
        logger.info(f"Proveedor cambiado a: {provider_name}")
        return True
    
    def get_available_providers(self) -> list[str]:
        """Lista proveedores disponibles."""
        return list(_PROVIDERS.keys())


# Instancia global
_ai_manager: Optional[AIManager] = None

def get_ai_manager() -> AIManager:
    """Retorna la instancia singleton del AI Manager."""
    global _ai_manager
    if _ai_manager is None:
        _ai_manager = AIManager()
    return _ai_manager


def get_ai_provider() -> AIProvider:
    """Shortcut para obtener el proveedor actual."""
    return get_ai_manager().provider