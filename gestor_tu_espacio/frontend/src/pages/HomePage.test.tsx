import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getStats } from "../services/systemService";
import { HomePage } from "./HomePage";

vi.mock("../services/systemService", () => ({
  getStats: vi.fn()
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(getStats).mockResolvedValue({
      events: 4,
      contacts: 9,
      assignments: 7,
      total: 20
    });
  });

  it("carga metricas desde el backend y muestra los accesos principales", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("20")).toBeTruthy();
    expect(screen.getByText("Una base limpia para seguir creciendo")).toBeTruthy();
    expect(screen.getByText("Mercados")).toBeTruthy();
    expect(screen.getByText("Asistente")).toBeTruthy();
  });
});
