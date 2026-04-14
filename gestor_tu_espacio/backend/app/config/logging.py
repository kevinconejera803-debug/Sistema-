"""Configuracion de logging."""

from __future__ import annotations

import logging
import logging.handlers
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]
LOG_DIR = APP_DIR / "logs"


def configure_logger() -> logging.Logger:
    """Construye un logger idempotente para la aplicacion."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    app_logger = logging.getLogger("tu_espacio")
    app_logger.setLevel(logging.DEBUG)
    app_logger.propagate = False

    if app_logger.handlers:
        return app_logger

    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    file_handler = logging.handlers.RotatingFileHandler(
        LOG_DIR / "tu_espacio.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    app_logger.addHandler(file_handler)
    app_logger.addHandler(console_handler)
    return app_logger


logger = configure_logger()
