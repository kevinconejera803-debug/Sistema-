import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { askAssistant, getAssistantHistory } from "../services/assistantService";
import { AssistantPage } from "./AssistantPage";

vi.mock("../services/assistantService", () => ({
  askAssistant: vi.fn(),
  getAssistantHistory: vi.fn()
}));

describe("AssistantPage", () => {
  beforeEach(() => {
    vi.mocked(getAssistantHistory).mockResolvedValue({
      messages: []
    });
    vi.mocked(askAssistant).mockResolvedValue({
      answer: "Prioriza el bloque de estudio de hoy.",
      provider: "system",
      sources: "https://example.com/fuente"
    });
  });

  it("envia preguntas y agrega la respuesta contextual al chat", async () => {
    const user = userEvent.setup();

    render(<AssistantPage />);

    expect(await screen.findByText(/Este asistente responde con reglas locales/)).toBeTruthy();
    await user.type(
      screen.getByPlaceholderText("Pregunta algo sobre tu agenda, tareas o contexto actual..."),
      "Que deberia hacer hoy?"
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(vi.mocked(askAssistant)).toHaveBeenCalledWith("Que deberia hacer hoy?");
    expect(await screen.findByText(/Prioriza el bloque de estudio de hoy\./)).toBeTruthy();
    expect(screen.getByText(/Fuentes:/)).toBeTruthy();
  });

  it("carga historial persistido al entrar a la pagina", async () => {
    vi.mocked(getAssistantHistory).mockResolvedValue({
      messages: [
        {
          id: "user-1",
          role: "user",
          content: "Que tengo hoy?",
          intent: "calendar",
          timestamp: "2026-04-14T01:00:00+00:00"
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Tienes una reunion a las 10:00.",
          intent: "calendar",
          timestamp: "2026-04-14T01:00:00+00:00"
        }
      ]
    });

    render(<AssistantPage />);

    expect(await screen.findByText("Que tengo hoy?")).toBeTruthy();
    expect(await screen.findByText("Tienes una reunion a las 10:00.")).toBeTruthy();
  });
});
