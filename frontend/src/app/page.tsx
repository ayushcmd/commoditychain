"use client";

import { useState } from "react";
import { usePrices } from "@/hooks/usePrices";
import { Topbar } from "@/components/Topbar";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  formatPrice, formatPercent, formatChange,
  calcVolatility, VOLATILITY_COLORS, VOLATILITY_LABELS,
} from "@/lib/utils";
import { Commodity } from "@/types";

type Category = "all" | "energy" | "metals";

/* ─── Mini bar chart ─────────────────────────────────────── */
function BarChart({ data, positive }: { data: { timestamp: string; price: number }[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const prices = data.slice(-12).map(p => p.price);
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  const color = positive ? "var(--up)" : "var(--dn)";
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "40px" }}>
      {prices.map((p, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: "2px 2px 0 0",
          height: `${Math.max(12, ((p - min) / range) * 40)}px`,
          background: i === prices.length - 1 ? color : color + "40",
          transition: "height 0.3s var(--ease)",
        }} />
      ))}
    </div>
  );
}

/* ─── Price card ─────────────────────────────────────────── */
function PriceCard({ c, index }: { c: Commodity; index: number }) {
  const pos = c.changePercent >= 0;
  const vol = calcVolatility(c.history);

  return (
    <div
      className={`card fade-up d${Math.min(index + 1, 8)}`}
      style={{ padding: "1.1rem 1.25rem", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(240,123,0,0.2)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Top accent */}
      <div style={{
        height: "2px", borderRadius: "14px 14px 0 0",
        margin: "-1.1rem -1.25rem 0.9rem",
        background: c.category === "energy"
          ? "linear-gradient(90deg, var(--orange-mid), var(--orange-bright))"
          : "linear-gradient(90deg, #C8A800, #F5C542)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.7rem" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)", marginBottom: "1px" }}>{c.name}</div>
          <div style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{c.unit}</div>
        </div>
        <span style={{
          fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", letterSpacing: "0.04em",
          background: `${VOLATILITY_COLORS[vol]}18`, color: VOLATILITY_COLORS[vol], border: `0.5px solid ${VOLATILITY_COLORS[vol]}40`,
        }}>
          {VOLATILITY_LABELS[vol]}
        </span>
      </div>

      {/* Price */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.03em", marginBottom: "4px" }}>
        {formatPrice(c.price, c.currency)}
      </div>

      {/* Change row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.9rem" }}>
        <span className={pos ? "up-pill" : "dn-pill"}>{formatPercent(c.changePercent)}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: pos ? "var(--up)" : "var(--dn)" }}>
          {formatChange(c.change, c.currency)}
        </span>
      </div>

      {/* Bar chart */}
      <BarChart data={c.history} positive={pos} />

      {/* H/L footer */}
      <div style={{ display: "flex", gap: "12px", marginTop: "10px", paddingTop: "10px", borderTop: "0.5px solid var(--border)" }}>
        {[
          { l: "HIGH",  v: formatPrice(c.high24h, c.currency),      col: "var(--up)" },
          { l: "LOW",   v: formatPrice(c.low24h, c.currency),       col: "var(--dn)" },
          { l: "PREV",  v: formatPrice(c.previousClose, c.currency), col: "var(--text-2)" },
        ].map(s => (
          <div key={s.l} style={{ flex: 1 }}>
            <div style={{ fontSize: "8px", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: "2px" }}>{s.l}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: s.col }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Movers table row ───────────────────────────────────── */
function MoverRow({ c, rank }: { c: Commodity; rank: number }) {
  const pos = c.changePercent >= 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}>
      <div style={{ width: "20px", fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--font-mono)", textAlign: "right" }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-1)" }}>{c.name}</div>
        <div style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{c.unit}</div>
      </div>
      <Sparkline data={c.history} width={60} height={24} positive={pos} />
      <div style={{ textAlign: "right", minWidth: "80px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>{formatPrice(c.price, c.currency)}</div>
        <span className={pos ? "up-pill" : "dn-pill"}>{formatPercent(c.changePercent)}</span>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const { commodities, loading, error, lastUpdated, isConnected, refresh } = usePrices();
  const [cat, setCat] = useState<Category>("all");

  const filtered = cat === "all" ? commodities : commodities.filter(c => c.category === cat);

  const gainers = commodities.filter(c => c.changePercent > 0).length;
  const losers  = commodities.filter(c => c.changePercent < 0).length;

  const sorted   = [...commodities].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  const topMover = sorted[0];
  const topGain  = [...commodities].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoss  = [...commodities].sort((a, b) => a.changePercent - b.changePercent)[0];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Live commodity market overview"
        isConnected={isConnected}
        lastUpdated={lastUpdated}
        actions={
          <button onClick={refresh}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--orange-mid)", border: "none", borderRadius: "9px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 6A4 4 0 112 6M10 6V3M10 6H7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        }
      />

      <div className="app-content">

        {/* Page heading */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.03em", marginBottom: "3px" }}>Market Dashboard</h1>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Real-time prices — updated every 60 seconds</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "var(--dn-bg)", border: "0.5px solid rgba(220,38,38,0.25)", borderRadius: "9px", padding: "10px 14px", marginBottom: "1rem", fontSize: "12px", color: "var(--dn)" }}>{error}</div>
        )}

        {/* Stats row — 5 cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Markets",  value: commodities.length,  col: "var(--text-1)", mono: true },
            { label: "Gainers",        value: gainers,              col: "var(--up)",     mono: true },
            { label: "Losers",         value: losers,               col: "var(--dn)",     mono: true },
            { label: "Top Gainer",     value: topGain?.name ?? "—", sub: topGain ? formatPercent(topGain.changePercent) : "", col: "var(--up)", mono: false },
            { label: "Top Loser",      value: topLoss?.name ?? "—", sub: topLoss ? formatPercent(topLoss.changePercent) : "", col: "var(--dn)", mono: false },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "1rem 1.1rem" }}>
              <div style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.09em", marginBottom: "6px", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontFamily: s.mono ? "var(--font-mono)" : "var(--font-ui)", fontSize: s.mono ? "24px" : "14px", fontWeight: 700, color: s.col, letterSpacing: s.mono ? "-0.03em" : "-0.01em", lineHeight: 1.1 }}>{s.value}</div>
              {"sub" in s && s.sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: s.col, marginTop: "3px", opacity: 0.85 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Main grid: cards left, movers + trend right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px", alignItems: "start" }}>

          {/* Left — filter + cards */}
          <div>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "1rem", background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
              {(["all", "energy", "metals"] as Category[]).map(t => (
                <button key={t} onClick={() => setCat(t)}
                  style={{ background: cat === t ? "var(--orange-mid)" : "transparent", border: "none", borderRadius: "7px", padding: "5px 14px", fontSize: "12px", fontWeight: 500, color: cat === t ? "#fff" : "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all 0.15s", textTransform: "capitalize" }}>
                  {t === "all" ? "All Markets" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Skeletons */}
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: "200px" }} />
                ))}
              </div>
            )}

            {/* Cards */}
            {!loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {filtered.map((c, i) => <PriceCard key={c.id} c={c} index={i} />)}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-3)", fontSize: "13px" }}>No commodities in this category.</div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Top movers */}
            <div className="card" style={{ padding: "1.1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>Top Movers</div>
                <span style={{ fontSize: "10px", color: "var(--text-3)" }}>24h change</span>
              </div>
              {sorted.slice(0, 5).map((c, i) => <MoverRow key={c.id} c={c} rank={i + 1} />)}
            </div>

            {/* Market summary */}
            <div className="card" style={{ padding: "1.1rem 1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.9rem" }}>Market Sentiment</div>
              {/* Visual gauge */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-3)", marginBottom: "6px" }}>
                  <span>Bearish</span>
                  <span>Bullish</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-elevated)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${commodities.length ? (gainers / commodities.length) * 100 : 50}%`, background: "linear-gradient(90deg, var(--dn), var(--up))", borderRadius: "4px", transition: "width 0.5s var(--ease)" }} />
                </div>
                <div style={{ textAlign: "center", marginTop: "6px", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: gainers > losers ? "var(--up)" : "var(--dn)" }}>
                  {gainers > losers ? "Mostly Bullish" : gainers < losers ? "Mostly Bearish" : "Mixed"}
                </div>
              </div>

              {/* Breakdown */}
              {[
                { label: "Gainers",   value: gainers, color: "var(--up)" },
                { label: "Losers",    value: losers,  color: "var(--dn)" },
                { label: "Unchanged", value: commodities.length - gainers - losers, color: "var(--text-3)" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "0.5px solid var(--border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Quick nav cards */}
            <div className="card" style={{ padding: "1.1rem 1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "0.75rem" }}>Quick Access</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {[
                  { label: "AI Analyst",  href: "/analyst",   color: "#8B5CF6" },
                  { label: "Simulator",   href: "/simulator", color: "var(--orange-mid)" },
                  { label: "India Layer", href: "/india",     color: "#16A34A" },
                  { label: "Correlation", href: "/correlation", color: "#3B82F6" },
                ].map(q => (
                  <a key={q.href} href={q.href}
                    style={{ display: "block", background: `${q.color}10`, border: `0.5px solid ${q.color}30`, borderRadius: "9px", padding: "9px 10px", textDecoration: "none", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${q.color}20`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${q.color}10`; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: q.color }}>{q.label}</div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          <span>CommodityChain v4 — Data: metals.live + GBM simulation</span>
          <span>Prices indicative — not financial advice</span>
        </div>
      </div>
    </>
  );
}
