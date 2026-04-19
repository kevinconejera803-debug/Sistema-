import { API_CONFIG, ERROR_MESSAGES } from "../constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    const payload = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const message =
        typeof payload === "object" && payload !== null && "error" in payload
          ? String(payload.error)
          : `Error HTTP ${response.status}`;
      
      throw new ApiError(
        message,
        response.status,
        response.status >= 500 || response.status === 429 // Retryable: 5xx or rate limit
      );
    }

    return payload as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 408, true);
      }
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, true);
    }
    
    throw new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

// Convenience methods
export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) => 
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => 
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => 
    apiRequest<T>(path, { method: "DELETE" }),
};