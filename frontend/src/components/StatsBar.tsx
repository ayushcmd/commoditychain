"use client";

import { Commodity } from "@/types";
import { formatPercent } from "@/lib/utils";

interface StatsBarProps {
  commodities: Commodity[];
}

export function StatsBar({ commodities }: StatsBarProps) {
  const gainers = commodities.filter((c) => c.changePercent > 0).length;
  const losers = commodities.filter((c) => c.changePercent < 0).length;
  const flat = commodities.length - gainers - losers;

  const topGainer = [...commodities].sort(
    (a, b) => b.changePercent - a.changePercent
  )[0];
  const topLoser = [...commodities].sort(
    (a, b) => a.changePercent - b.changePercent
  )[0];

  return (
    <div
      style={{
        display: "flex",
        gap: "1px",
        background: "var(--border)",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      {[
        {
          label: "Gainers",
          value: gainers,
          color: "var(--up)",
          dim: "var(--up-dim)",
        },
        {
          label: "Losers",
          value: losers,
          color: "var(--down)",
          dim: "var(--down-dim)",
        },
        {
          label: "Unchanged",
          value: flat,
          color: "var(--text-tertiary)",
          dim: "var(--bg-card)",
        },
        ...(topGainer
          ? [
              {
                label: "Top Gainer",
                value: topGainer.name,
                sub: formatPercent(topGainer.changePercent),
                color: "var(--up)",
                dim: "var(--bg-card)",
              },
            ]
          : []),
        ...(topLoser
          ? [
              {
                label: "Top Loser",
                value: topLoser.name,
                sub: formatPercent(topLoser.changePercent),
                color: "var(--down)",
                dim: "var(--bg-card)",
              },
            ]
          : []),
      ].map((stat, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: "var(--bg-card)",
            padding: "0.75rem 1rem",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-tertiary)",
              letterSpacing: "0.07em",
              marginBottom: "4px",
            }}
          >
            {stat.label.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "18px",
              fontWeight: 600,
              color: stat.color,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </div>
          {"sub" in stat && stat.sub && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: stat.color,
                marginTop: "2px",
                opacity: 0.8,
              }}
            >
              {stat.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
