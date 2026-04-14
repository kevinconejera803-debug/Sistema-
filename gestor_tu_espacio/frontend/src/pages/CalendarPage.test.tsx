import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEvent, deleteEvent, getEvents } from "../services/calendarService";
import { CalendarPage } from "./CalendarPage";

vi.mock("../services/calendarService", () => ({
  getEvents: vi.fn(),
  createEvent: vi.fn(),
  deleteEvent: vi.fn()
}));

describe("CalendarPage", () => {
  beforeEach(() => {
    vi.mocked(getEvents).mockResolvedValue([]);
    vi.mocked(createEvent).mockResolvedValue({
      id: 1,
      title: "Reunion de avance",
      start_iso: "2026-04-20T14:30:00",
      end_iso: null,
      all_day: 0,
      color: "teal",
      notes: ""
    });
    vi.mocked(deleteEvent).mockResolvedValue({ ok: true });
  });

  it("crea eventos y recarga la lista", async () => {
    const user = userEvent.setup();
    const { container } = render(<CalendarPage />);

    await waitFor(() => {
      expect(vi.mocked(getEvents)).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByPlaceholderText("Titulo"), "Reunion de avance");

    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');

    if (!(dateInput instanceof HTMLInputElement) || !(timeInput instanceof HTMLInputElement)) {
      throw new Error("No se encontraron los campos de fecha y hora.");
    }

    fireEvent.change(dateInput, { target: { value: "2026-04-20" } });
    fireEvent.change(timeInput, { target: { value: "14:30" } });

    await user.click(screen.getByRole("button", { name: "Guardar evento" }));

    await waitFor(() => {
      expect(vi.mocked(createEvent)).toHaveBeenCalledWith({
        title: "Reunion de avance",
        start_iso: "2026-04-20T14:30:00",
        end_iso: null,
        all_day: 0,
        color: "teal",
        notes: ""
      });
    });

    await waitFor(() => {
      expect(vi.mocked(getEvents)).toHaveBeenCalledTimes(2);
    });
  });
});
