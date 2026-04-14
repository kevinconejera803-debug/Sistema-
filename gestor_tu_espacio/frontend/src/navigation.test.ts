import { describe, expect, it } from "vitest";
import { appRoutes, navigation } from "./navigation";

describe("navigation", () => {
  it("mantiene una sola fuente de verdad para rutas y sidebar", () => {
    expect(navigation).toHaveLength(appRoutes.length);
    expect(new Set(appRoutes.map((route) => route.path)).size).toBe(appRoutes.length);
    expect(appRoutes.some((route) => route.index && route.path === "/")).toBe(true);
  });
});
