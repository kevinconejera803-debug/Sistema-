"""
Interfaz base para proveedores de IA.
Define el contrato que todo proveedor (mock, ollama, openai, etc) debe implementar.
"""
from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass

@dataclass
class AIResponse:
    """Respuesta estandarizada del proveedor de IA."""
    content: str
    model: str
    usage: Optional[dict] = None
    latency_ms: Optional[int] = None

class AIProvider(ABC):
    """Clase base abstracta para todos los proveedores de IA."""
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.model_name = self.config.get("model", "unknown")
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> AIResponse:
        """
        Genera una respuesta a partir de un prompt.
        
        Args:
            prompt: Texto de entrada
            **kwargs: Parámetros adicionales (temperature, max_tokens, etc)
            
        Returns:
            AIResponse con la respuesta generada
        """
        pass
    
    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """
        Genera embeddings para texto.
        
        Args:
            text: Texto a convertir en vector
            
        Returns:
            Lista de floats representando el embedding
        """
        pass
    
    def is_available(self) -> bool:
        """Verifica si el proveedor está disponible."""
        return True