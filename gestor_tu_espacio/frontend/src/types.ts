export type EventItem = {
  id: number;
  title: string;
  start_iso: string;
  end_iso?: string | null;
  all_day: number;
  color: string;
  notes: string;
};

export type Assignment = {
  id: number;
  course: string;
  title: string;
  due_iso: string;
  status: string;
  weight: number;
  notes: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
};

export type MarketRow = {
  symbol: string;
  price: number;
  chg_pct: number;
  price_fmt?: string;
  chg_fmt?: string;
};

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  region: string;
  region_label: string;
  summary: string;
  published: string;
};

export type StatsPayload = {
  events: number;
  contacts: number;
  assignments: number;
  total: number;
};

export type AssistantResponse = {
  answer: string;
  provider: string;
  sources?: string;
};

export type AssistantHistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent: string;
  timestamp: string;
};

export type AssistantHistoryPayload = {
  messages: AssistantHistoryMessage[];
};

export type PrayerItem = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "answered";
};
