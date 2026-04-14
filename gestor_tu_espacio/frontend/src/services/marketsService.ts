import type { MarketRow } from "../types";
import { apiRequest } from "./apiClient";

type MarketsPayload = {
  rows: MarketRow[];
};

export function getMarkets(): Promise<MarketsPayload> {
  return apiRequest<MarketsPayload>("/mercados");
}
