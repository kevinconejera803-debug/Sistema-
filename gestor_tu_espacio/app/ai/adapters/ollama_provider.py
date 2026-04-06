"""
OllamaProvider - Proveedor de IA para Ollama (modelos locales).

INSTALACIÓN:
1. Instalar Ollama: https://ollama.ai
2. Ejecutar: ollama serve
3. Descargar modelo: ollama pull llama3
4. Configurar en .env: AI_PROVIDER=ollama

CONFIGURACIÓN (.env):
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
"""
import asyncio
import time
import requests
from app.ai import AIProvider, AIResponse
from app.config import logger

class OllamaProvider(AIProvider):
    """Proveedor de IA usando Ollama (modelos locales)."""
    
    DEFAULT_TIMEOUT = 30  # segundos
    
    def __init__(self, config: dict = None):
        config = config or {}
        super().__init__(config)
        
        self.base_url = config.get("ollama_url", "http://localhost:11434")
        self.model = config.get("ollama_model", "llama3")
        self.timeout = config.get("timeout", self.DEFAULT_TIMEOUT)
        
        # Verificar conexión al inicializar
        self._available = self._check_connection()
        
        if self._available:
            logger.info(f"Ollama inicializado con modelo: {self.model}")
        else:
            logger.warning(f"Ollama no disponible en {self.base_url}")
    
    def _check_connection(self) -> bool:
        """Verifica que Ollama esté corriendo y disponible."""
        try:
            response = requests.get(
                f"{self.base_url}/api/tags",
                timeout=5
            )
            return response.status_code == 200
        except requests.exceptions.ConnectException:
            logger.error(f"No se puede conectar a Ollama en {self.base_url}")
            return False
        except requests.exceptions.Timeout:
            logger.error("Timeout verificando conexión a Ollama")
            return False
        except Exception as e:
            logger.error(f"Error verificando Ollama: {e}")
            return False
    
    async def generate(self, prompt: str, **kwargs) -> AIResponse:
        """
        Genera una respuesta usando Ollama.
        
        Args:
            prompt: Texto de entrada para el modelo
            **kwargs: Parámetros adicionales (temperature, max_tokens)
            
        Returns:
            AIResponse con la respuesta del modelo
        """
        if not self.is_available():
            return AIResponse(
                content="❌ Ollama no está disponible. Asegúrate de:\n"
                       "1.Tener Ollama instalado (ollama.ai)\n"
                       "2.Ejecutar 'ollama serve' en terminal\n"
                       "3.Tener un modelo descargado ('ollama pull llama3')",
                model=f"ollama:{self.model}"
            )
        
        result = await asyncio.to_thread(self._generate_sync, prompt, kwargs)
        return result
    
    def _generate_sync(self, prompt: str, kwargs: dict) -> AIResponse:
        """Versión síncrona para llamar via to_thread."""
        start_time = time.time()
        
        temperature = kwargs.get("temperature", 0.7)
        max_tokens = kwargs.get("max_tokens", 500)
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            }
        }
        
        try:
            logger.info(f"Ollama request: model={self.model}, prompt_len={len(prompt)}")
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )
            
            response.raise_for_status()
            result = response.json()
            
            content = result.get("response", "").strip()
            
            if not content:
                logger.warning("Ollama retornó respuesta vacía")
                content = "El modelo no generó respuesta. Intenta con otro prompt."
            
            latency = int((time.time() - start_time) * 1000)
            logger.info(f"Ollama response: {len(content)} chars, {latency}ms")
            
            return AIResponse(
                content=content,
                model=f"ollama:{self.model}",
                latency_ms=latency
            )
            
        except requests.exceptions.Timeout:
            logger.error("Timeout esperando respuesta de Ollama")
            return AIResponse(
                content="⏱️ Timeout: Ollama tardó demasiado en responder.\n"
                       "El modelo puede estar muy ocupado o sin suficientes recursos.",
                model=f"ollama:{self.model}"
            )
            
        except requests.exceptions.ConnectionError:
            logger.error("No se pudo conectar a Ollama")
            return AIResponse(
                content="🔌 No se puede conectar a Ollama.\n"
                       "Verifica que 'ollama serve' esté ejecutándose.",
                model=f"ollama:{self.model}"
            )
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"Error HTTP de Ollama: {e}")
            return AIResponse(
                content=f"❌ Error de Ollama: {e.response.status_code}\n"
                       "El modelo puede no estar instalado. Prueba 'ollama list'",
                model=f"ollama:{self.model}"
            )
            
        except Exception as e:
            logger.error(f"Error inesperado con Ollama: {e}")
            return AIResponse(
                content=f"❌ Error inesperado: {str(e)}",
                model=f"ollama:{self.model}"
            )
    
    async def embed(self, text: str) -> list[float]:
        """
        Genera embeddings para texto (si el modelo lo soporta).
        Nota: No todos los modelos de Ollama soportan embeddings.
        """
        return await asyncio.to_thread(self._embed_sync, text)
    
    def _embed_sync(self, text: str) -> list[float]:
        """Versión síncrona para embeddings."""
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
        """Retorna si Ollama está disponible."""
        return self._available
    
    def list_models(self) -> list[str]:
        """Lista los modelos disponibles en Ollama."""
        try:
            response = requests.get(
                f"{self.base_url}/api/tags",
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
        except:
            pass
        return []


# ============================================================
# EJEMPLO DE USO
# ============================================================
"""
# Configuración en .env:
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Uso directo:
from app.ai.adapters.ollama_provider import OllamaProvider

config = {"ollama_url": "http://localhost:11434", "ollama_model": "llama3"}
provider = OllamaProvider(config)

if provider.is_available():
    response = provider.generate("Hola, ¿cómo estás?")
    print(response.content)
else:
    print("Ollama no está disponible")

# Via endpoint:
# GET /api/ai/ask?q=Hola
"""