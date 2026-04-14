"""Shim y helpers compartidos."""

from __future__ import annotations

import time
from functools import wraps
from typing import Any, Callable

from app.config import API_TIMEOUT, MAX_RETRIES, logger


def retry_with_backoff(
    func: Callable,
    max_attempts: int = MAX_RETRIES,
    backoff_factor: float = 2.0,
    timeout: int = API_TIMEOUT,
) -> Any:
    """Ejecuta una funcion con reintentos exponenciales."""
    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            return func(timeout=timeout)
        except Exception as error:  # pragma: no cover - dependiente de red
            last_error = error
            if attempt < max_attempts:
                wait_time = backoff_factor ** (attempt - 1)
                logger.warning(
                    "Intento %s/%s fallo: %s. Reintentando en %ss...",
                    attempt,
                    max_attempts,
                    error,
                    wait_time,
                )
                time.sleep(wait_time)
            else:
                logger.error("Fallo despues de %s intentos: %s", max_attempts, error)

    raise last_error or RuntimeError("Fallo despues de multiples intentos")


def log_endpoint(func: Callable) -> Callable:
    """Decorador para loguear accesos a endpoints."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info("Acceso a %s", func.__name__)
        try:
            response = func(*args, **kwargs)
            logger.debug("%s exitoso", func.__name__)
            return response
        except Exception as error:
            logger.error("%s error: %s", func.__name__, error, exc_info=True)
            raise

    return wrapper


__all__ = [
    "log_endpoint",
    "retry_with_backoff",
]