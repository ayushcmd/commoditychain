"use client";

import { Commodity } from "@/types";
import { formatPrice, formatPercent } from "@/lib/utils";

interface TickerProps {
  commodities: Commodity[];
}

export function Ticker({ commodities }: TickerProps) {
  if (commodities.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...commodities, ...commodities];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        borderBottom: "0.5px solid var(--border)",
        background: "var(--bg-card)",
        height: "36px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          animation: "ticker-scroll 40s linear infinite",
          willChange: "transform",
          whiteSpace: "nowrap",
        }}
      >
        {items.map((c, i) => {
          const isPositive = c.changePercent >= 0;
          return (
            <span
              key={`${c.id}-${i}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 20px",
                borderRight: "0.5px solid var(--border)",
                height: "36px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.05em",
                }}
              >
                {c.name.toUpperCase().substring(0, 10)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {formatPrice(c.price, c.currency)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: isPositive ? "var(--up)" : "var(--down)",
                }}
              >
                {formatPercent(c.changePercent)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
