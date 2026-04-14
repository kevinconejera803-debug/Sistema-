"""Constantes compartidas de la aplicacion."""

APP_NAME = "Tu Espacio"
APP_VERSION = "1.0.0"
SERVICE_NAME = "tu_espacio"

MODULES = 8

VALID_EVENT_COLORS = {
    "teal",
    "yellow",
    "purple",
    "red",
    "green",
    "blue",
    "cyan",
}
VALID_ASSIGNMENT_STATUS = {
    "pendiente",
    "completado",
    "completada",
    "entregado",
    "calificado",
}
COMPLETED_ASSIGNMENT_STATUSES = {"completado", "completada", "entregado", "calificado"}

MAX_STRING_LENGTH = 500
MAX_NOTES_LENGTH = 2000
MAX_WEIGHT = 100
MIN_WEIGHT = 0

DEFAULT_PAGE_LIMIT = 50
MAX_PAGE_LIMIT = 200

NEWS_TTL = 90.0
MARKETS_TTL = 60.0
MERCADOS_TTL = MARKETS_TTL
API_TIMEOUT = 10
MAX_RETRIES = 3

SEARCH_TIMEOUT = 15
SEARCH_ENABLED = True

FRONTEND_ROUTES = {
    "calendario",
    "universidad",
    "contactos",
    "mercados",
    "noticias",
    "asistente",
    "oraciones",
}

LEGACY_ROUTE_REDIRECTS = {
    "tu-espacio": "/",
    "trading-lab": "/mercados",
    "investigacion": "/asistente",
    "ciberseguridad": "/",
}
