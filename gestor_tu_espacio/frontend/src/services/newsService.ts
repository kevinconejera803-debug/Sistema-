import type { NewsItem } from "../types";
import { apiRequest } from "./apiClient";

type NewsPayload = {
  items: NewsItem[];
  fetched_at: string;
  ttl_seconds: number;
};

export function getNews(): Promise<NewsPayload> {
  return apiRequest<NewsPayload>("/news");
}
