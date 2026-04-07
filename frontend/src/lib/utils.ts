import { VolatilityLevel, PricePoint } from "@/types";

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(price);
}

export function formatChange(change: number, currency = "USD"): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${formatPrice(change, currency)}`;
}

export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000)     return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toFixed(0);
}

export function calcVolatility(history: PricePoint[]): VolatilityLevel {
  if (history.length < 2) return "low";
  const returns = history.slice(1).map((p, i) =>
    Math.abs((p.price - history[i].price) / history[i].price)
  );
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  if (avg > 0.03)  return "extreme";
  if (avg > 0.015) return "high";
  if (avg > 0.007) return "medium";
  return "low";
}

export const VOLATILITY_COLORS: Record<VolatilityLevel, string> = {
  low:     "#16A34A",
  medium:  "#D97706",
  high:    "#DC2626",
  extreme: "#B91C1C",
};

export const VOLATILITY_LABELS: Record<VolatilityLevel, string> = {
  low: "Low", medium: "Medium", high: "High", extreme: "Extreme",
};

export function getSparklinePath(points: PricePoint[], w: number, h: number): string {
  if (points.length < 2) return "";
  const prices = points.map(p => p.price);
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  const xStep = w / (points.length - 1);
  const coords = prices.map((p, i) => {
    const x = i * xStep;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${coords.join("L")}`;
}

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
