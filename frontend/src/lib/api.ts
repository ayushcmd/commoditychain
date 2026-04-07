import { Commodity, NewsArticle, FxRates } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  getPrices:      ()            => get<Commodity[]>("/api/prices"),
  getCommodity:   (id: string)  => get<Commodity>(`/api/prices/${id}`),
  getTicker:      ()            => get<{ id: string; name: string; price: number; changePercent: number; currency: string }[]>("/api/ticker"),
  getNews:        (commodity = "all") => get<NewsArticle[]>(`/api/news?commodity=${commodity}&limit=12`),
  getRates:       ()            => get<FxRates>("/api/rates"),
};
