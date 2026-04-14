import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { askAssistant } from "../services/assistantService";
import { AssistantPage } from "./AssistantPage";

vi.mock("../services/assistantService", () => ({
  askAssistant: vi.fn()
}));

describe("AssistantPage", () => {
  beforeEach(() => {
    vi.mocked(askAssistant).mockResolvedValue({
      answer: "Prioriza el bloque de estudio de hoy.",
      provider: "system",
      sources: "https://example.com/fuente"
    });
  });

  it("envia preguntas y agrega la respuesta contextual al chat", async () => {
    const user = userEvent.setup();

    render(<AssistantPage />);

    await user.type(
      screen.getByPlaceholderText("Pregunta algo sobre tu agenda, tareas o contexto actual..."),
      "Que deberia hacer hoy?"
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(vi.mocked(askAssistant)).toHaveBeenCalledWith("Que deberia hacer hoy?");
    expect(await screen.findByText(/Prioriza el bloque de estudio de hoy\./)).toBeTruthy();
    expect(screen.getByText(/Fuentes:/)).toBeTruthy();
  });
});
