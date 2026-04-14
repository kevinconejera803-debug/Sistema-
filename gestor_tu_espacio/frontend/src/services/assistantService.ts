import type { AssistantResponse } from "../types";
import { apiRequest } from "./apiClient";

export function askAssistant(question: string): Promise<AssistantResponse> {
  return apiRequest<AssistantResponse>("/research/ask", {
    method: "POST",
    body: JSON.stringify({ question })
  });
}
