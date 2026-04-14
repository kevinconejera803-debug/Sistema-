import type { Assignment } from "../types";
import { apiRequest } from "./apiClient";

export function getAssignments(): Promise<Assignment[]> {
  return apiRequest<Assignment[]>("/assignments");
}

export function createAssignment(payload: Omit<Assignment, "id">): Promise<Assignment> {
  return apiRequest<Assignment>("/assignments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAssignment(
  assignmentId: number,
  payload: Partial<Omit<Assignment, "id">>
): Promise<Assignment> {
  return apiRequest<Assignment>(`/assignments/${assignmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAssignment(assignmentId: number): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/assignments/${assignmentId}`, {
    method: "DELETE"
  });
}
