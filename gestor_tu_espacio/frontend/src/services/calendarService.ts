import type { EventItem } from "../types";
import { apiRequest } from "./apiClient";

export function getEvents(): Promise<EventItem[]> {
  return apiRequest<EventItem[]>("/calendar/events");
}

export function createEvent(payload: Omit<EventItem, "id">): Promise<EventItem> {
  return apiRequest<EventItem>("/calendar/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteEvent(eventId: number): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/calendar/events/${eventId}`, {
    method: "DELETE"
  });
}
