import type { AssistantHistoryPayload, AssistantResponse } from "../types";
import { apiRequest } from "./apiClient";

export function askAssistant(question: string): Promise<AssistantResponse> {
  return apiRequest<AssistantResponse>("/research/ask", {
    method: "POST",
    body: JSON.stringify({ question })
  });
}

export function getAssistantHistory(limit = 10): Promise<AssistantHistoryPayload> {
  return apiRequest<AssistantHistoryPayload>(`/research/history?limit=${limit}`);
}
