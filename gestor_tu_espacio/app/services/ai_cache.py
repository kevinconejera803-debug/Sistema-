"""
Cache de respuestas de IA para reducir latencia.
"""
import hashlib
import time
from typing import Optional


class AICache:
    """Cache simple con TTL para respuestas de IA."""
    
    def __init__(self, ttl: int = 300):
        self._cache: dict[str, dict] = {}
        self._ttl = ttl
    
    def _hash(self, prompt: str) -> str:
        """Genera hash del prompt."""
        return hashlib.md5(prompt.encode()).hexdigest()
    
    def get(self, prompt: str) -> Optional[str]:
        """Obtiene respuesta cacheada si existe y no expired."""
        key = self._hash(prompt)
        entry = self._cache.get(key)
        
        if entry is None:
            return None
        
        if time.time() - entry["t"] > self._ttl:
            del self._cache[key]
            return None
        
        return entry["v"]
    
    def set(self, prompt: str, response: str) -> None:
        """Guarda respuesta en cache."""
        key = self._hash(prompt)
        self._cache[key] = {"v": response, "t": time.time()}
    
    def clear(self) -> None:
        """Limpia cache."""
        self._cache.clear()


ai_cache = AICache(ttl=300)


def get_ai_cache() -> AICache:
    """Retorna instancia del cache."""
    return ai_cache