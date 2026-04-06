"""
OllamaAdapter: Adaptador para modelos locales via Ollama.
Pendiente de implementar cuando el usuario tenga Ollama instalado.

Usage:
1. Instalar Ollama: https://ollama.ai
2. Ejecutar: ollama serve
3. Descargar modelo: ollama pull llama3
4. Configurar en .env: AI_PROVIDER=ollama
"""
from typing import Optional
import requests
from app.ai import AIProvider, AIResponse
from app.config import logger

class OllamaProvider(AIProvider):
    """
    Proveedor para Ollama (modelos locales).
    Ventajas:
    - Sin costo de API
    - Privacidad total (datos no salen del equipo)
    -离线可用
    
    Desventajas:
    - Requiere hardware decente (8GB+ RAM, GPU recomendada)
    - Más lento que APIs cloud
    - Modelos menos capaces que GPT-4/Claude
    """
    
    def __init__(self, config: dict = None):
        super().__init__(config)
        self.base_url = config.get("ollama_url", "http://localhost:11434")
        self.model = config.get("ollama_model", "llama3")
        self._verify_connection()
    
    def _verify_connection(self):
        """Verifica que Ollama esté corriendo."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            if response.status_code == 200:
                logger.info(f"Ollama disponible en {self.base_url}")
                self._available = True
            else:
                self._available = False
        except Exception:
            self._available = False
            logger.warning(f"Ollama no disponible en {self.base_url}")
    
    async def generate(self, prompt: str, **kwargs) -> AIResponse:
        """Genera respuesta usando Ollama."""
        import time
        start_time = time.time()
        
        # Construir request
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": kwargs.get("temperature", 0.7),
                "num_predict": kwargs.get("max_tokens", 500),
                "stop": kwargs.get("stop", []),
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=kwargs.get("timeout", 60)
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get("response", "")
            
            latency = int((time.time() - start_time) * 1000)
            
            return AIResponse(
                content=content,
                model=f"ollama:{self.model}",
                latency_ms=latency
            )
            
        except requests.exceptions.Timeout:
            return AIResponse(
                content="Timeout: El modelo tardó demasiado en responder.",
                model=f"ollama:{self.model}"
            )
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return AIResponse(
                content=f"Error connecting to Ollama: {str(e)}",
                model=f"ollama:{self.model}"
            )
    
    async def embed(self, text: str) -> list[float]:
        """Genera embeddings usando Ollama."""
        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": text},
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            return result.get("embedding", [])
        except Exception as e:
            logger.error(f"Ollama embed error: {e}")
            return []
    
    def is_available(self) -> bool:
        """Verifica si Ollama está corriendo."""
        return getattr(self, "_available", False)
    
    def list_models(self) -> list[str]:
        """Lista modelos disponibles en Ollama."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
        except:
            pass
        return []


# Ejemplo de uso futuro:
"""
# Para habilitar Ollama, agregar al .env:
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Models disponibles en Ollama:
# - llama3 (recommended)
# - mistral
# - codellama
# - phi3
# - neural-chat
"""