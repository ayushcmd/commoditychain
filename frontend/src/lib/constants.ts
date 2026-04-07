export const COMMODITIES_CONFIG = [
  {
    id: "crude-wti",
    name: "Crude Oil WTI",
    ticker: "CL=F",
    unit: "per barrel",
    category: "energy" as const,
    currency: "USD",
    color: "#F07B00",
  },
  {
    id: "crude-brent",
    name: "Brent Crude",
    ticker: "BZ=F",
    unit: "per barrel",
    category: "energy" as const,
    currency: "USD",
    color: "#E86A00",
  },
  {
    id: "natural-gas",
    name: "Natural Gas",
    ticker: "NG=F",
    unit: "per MMBtu",
    category: "energy" as const,
    currency: "USD",
    color: "#3B82F6",
  },
  {
    id: "gold",
    name: "Gold",
    ticker: "GC=F",
    unit: "per troy oz",
    category: "metals" as const,
    currency: "USD",
    color: "#F5C542",
  },
  {
    id: "silver",
    name: "Silver",
    ticker: "SI=F",
    unit: "per troy oz",
    category: "metals" as const,
    currency: "USD",
    color: "#C0C0C0",
  },
  {
    id: "copper",
    name: "Copper",
    ticker: "HG=F",
    unit: "per lb",
    category: "metals" as const,
    currency: "USD",
    color: "#C87533",
  },
  {
    id: "aluminium",
    name: "Aluminium",
    ticker: "ALI=F",
    unit: "per lb",
    category: "metals" as const,
    currency: "USD",
    color: "#A8A9AD",
  },
  {
    id: "platinum",
    name: "Platinum",
    ticker: "PL=F",
    unit: "per troy oz",
    category: "metals" as const,
    currency: "USD",
    color: "#E5E4E2",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  energy: "Energy",
  metals: "Metals",
  agriculture: "Agriculture",
  other: "Other",
};

export const POLL_INTERVAL_MS = 60_000;
export const WS_RECONNECT_DELAY_MS = 3_000;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
