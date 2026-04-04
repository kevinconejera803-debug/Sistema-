"""
Configuración centralizada: logging, constantes, validaciones.
"""
import logging
import logging.handlers
from pathlib import Path

# Directorio de logs
LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Configurar logger
logger = logging.getLogger("tu_espacio")
logger.setLevel(logging.DEBUG)

# Handler para archivo
file_handler = logging.handlers.RotatingFileHandler(
    LOG_DIR / "tu_espacio.log",
    maxBytes=5*1024*1024,  # 5 MB
    backupCount=5
)
file_handler.setLevel(logging.DEBUG)

# Handler para consola
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formato
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Constantes de validación
VALID_EVENT_COLORS = {"teal", "yellow", "purple", "red"}
VALID_ASSIGNMENT_STATUS = {"pendiente", "completado", "entregado", "calificado"}
MAX_STRING_LENGTH = 500
MAX_NOTES_LENGTH = 2000
MAX_WEIGHT = 100
MIN_WEIGHT = 0

# Constantes de API
NEWS_TTL = 90.0
MERCADOS_TTL = 60.0
API_TIMEOUT = 10  # segundos
MAX_RETRIES = 3
