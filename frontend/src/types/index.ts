export interface Commodity {
  id: string;
  name: string;
  ticker: string;
  unit: string;
  category: "energy" | "metals" | "agriculture" | "other";
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketStatus: "open" | "closed" | "pre-market";
  lastUpdated: string;
  history: PricePoint[];
  currency: string;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  commodity: string;
  sentiment: "positive" | "negative" | "neutral";
  readTime: number;
  description: string;
}

export interface FxRates {
  [currency: string]: number;
}

export interface WatchlistItem {
  commodityId: string;
  buyPrice: number;
  quantity: number;
  addedAt: string;
}

export type ThemeMode = "dark" | "light";
export type VolatilityLevel = "low" | "medium" | "high" | "extreme";

export const UNIT_CONVERSIONS: Record<string, { label: string; toBase: number; fromBase: number; baseUnit: string }[]> = {
  energy: [
    { label: "Barrel",  toBase: 1,      fromBase: 1,      baseUnit: "barrel" },
    { label: "Litre",   toBase: 0.00629, fromBase: 158.99, baseUnit: "barrel" },
    { label: "Gallon",  toBase: 0.02381, fromBase: 42,     baseUnit: "barrel" },
    { label: "Cubic m", toBase: 0.00629, fromBase: 158.99, baseUnit: "barrel" },
  ],
  metals: [
    { label: "Troy oz", toBase: 1,        fromBase: 1,        baseUnit: "troy oz" },
    { label: "Gram",    toBase: 0.032151, fromBase: 31.1035,  baseUnit: "troy oz" },
    { label: "Kilogram",toBase: 32.1507,  fromBase: 0.032151, baseUnit: "troy oz" },
    { label: "Tola",    toBase: 0.374878, fromBase: 2.66667,  baseUnit: "troy oz" },
  ],
};
