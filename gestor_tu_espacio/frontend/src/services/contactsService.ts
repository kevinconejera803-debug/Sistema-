import type { Contact } from "../types";
import { apiRequest } from "./apiClient";

export function getContacts(): Promise<Contact[]> {
  return apiRequest<Contact[]>("/contacts");
}

export function createContact(payload: Omit<Contact, "id">): Promise<Contact> {
  return apiRequest<Contact>("/contacts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteContact(contactId: number): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/contacts/${contactId}`, {
    method: "DELETE"
  });
}
