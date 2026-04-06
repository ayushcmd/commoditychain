"use client";

import { Commodity } from "@/types";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  formatPrice,
  formatPercent,
  formatChange,
  calcVolatility,
  VOLATILITY_COLORS,
  VOLATILITY_LABELS,
} from "@/lib/utils";

interface PriceCardProps {
  commodity: Commodity;
  index: number;
}

export function PriceCard({ commodity, index }: PriceCardProps) {
  const isPositive = commodity.changePercent >= 0;
  const volatility = calcVolatility(commodity.history);
  const volColor = VOLATILITY_COLORS[volatility];
  const delayClass = `delay-${Math.min(index + 1, 8)}`;

  return (
    <article
      className={`price-card animate-fade-up ${delayClass}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1.25rem",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, transform 0.15s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--orange-border)";
        el.style.background = "var(--bg-card-hover)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--border)";
        el.style.background = "var(--bg-card)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Category accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1.5px",
          background:
            commodity.category === "energy"
              ? "var(--orange-mid)"
              : commodity.category === "metals"
              ? "#F5C542"
              : "#3B82F6",
          opacity: 0.6,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-1)",
              marginBottom: "2px",
              letterSpacing: "0.01em",
            }}
          >
            {commodity.name}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {commodity.unit}
          </div>
        </div>

        {/* Volatility badge */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: "20px",
            background: `${volColor}18`,
            color: volColor,
            border: `0.5px solid ${volColor}40`,
            letterSpacing: "0.04em",
          }}
        >
          {VOLATILITY_LABELS[volatility]}
        </span>
      </div>

      {/* Price + sparkline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "0.6rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--text-1)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {formatPrice(commodity.price, commodity.currency)}
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "4px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 500,
                color: isPositive ? "var(--up)" : "var(--dn)",
                background: isPositive ? "var(--up-bg)" : "var(--dn-bg)",
                padding: "2px 7px",
                borderRadius: "4px",
              }}
            >
              {formatPercent(commodity.changePercent)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-2)",
              }}
            >
              {formatChange(commodity.change, commodity.currency)}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <Sparkline
          data={commodity.history}
          width={100}
          height={44}
          positive={isPositive}
        />
      </div>

      {/* Footer — H/L */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          paddingTop: "0.6rem",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-3)",
              marginBottom: "1px",
              letterSpacing: "0.05em",
            }}
          >
            24H HIGH
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--up)",
            }}
          >
            {formatPrice(commodity.high24h, commodity.currency)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-3)",
              marginBottom: "1px",
              letterSpacing: "0.05em",
            }}
          >
            24H LOW
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--dn)",
            }}
          >
            {formatPrice(commodity.low24h, commodity.currency)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-3)",
              marginBottom: "1px",
              letterSpacing: "0.05em",
            }}
          >
            PREV CLOSE
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-2)",
            }}
          >
            {formatPrice(commodity.previousClose, commodity.currency)}
          </div>
        </div>
      </div>
    </article>
  );
}
