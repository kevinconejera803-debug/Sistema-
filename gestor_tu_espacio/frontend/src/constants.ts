// API Configuration Constants
// Centralized magic strings for maintainability

export const API_CONFIG = {
  BASE_URL: "/api",
  TIMEOUT_MS: 30_000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1_000,
} as const;

export const RATE_LIMITS = {
  RESEARCH_ASK: "10 per minute",
  DEFAULT: "200 per day",
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

export const CACHE_TTL = {
  NEWS_MS: 60_000,      // 1 minute
  MARKETS_MS: 60_000,   // 1 minute
  STATS_MS: 30_000,     // 30 seconds
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Error de conexión. Verifica tu conexión a internet.",
  TIMEOUT_ERROR: "La solicitud tardó demasiado.",
  UNKNOWN_ERROR: "Algo salió mal. Intenta de nuevo.",
  NOT_FOUND: "Recurso no encontrado.",
  VALIDATION_ERROR: "Datos inválidos.",
} as const;