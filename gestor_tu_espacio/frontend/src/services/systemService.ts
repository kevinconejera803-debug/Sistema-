import type { StatsPayload } from "../types";
import { apiRequest } from "./apiClient";

export function getStats(): Promise<StatsPayload> {
  return apiRequest<StatsPayload>("/stats");
}
