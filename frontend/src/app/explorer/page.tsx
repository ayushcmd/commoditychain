"use client";

import { useState, useEffect, useRef } from "react";
import { Commodity } from "@/types";
import { api } from "@/lib/api";
import { formatPrice, formatPercent, formatChange, calcVolatility, VOLATILITY_COLORS, VOLATILITY_LABELS } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { usePrices } from "@/hooks/usePrices";

type Range = "1W" | "1M" | "3M" | "1Y";
const RANGES: Range[] = ["1W", "1M", "3M", "1Y"];

function MiniChart({ data, positive, width, height }: { data: { timestamp: string; price: number }[]; positive: boolean; width: number; height: number }) {
  if (!data || data.length < 2) return null;
  const prices = data.map(p => p.price);
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  const pad = 8;
  const w = width - pad * 2, h = height - pad * 2;
  const pts = prices.map((p, i) => `${pad + (i / (prices.length - 1)) * w},${pad + h - ((p - min) / range) * h}`);
  const polyline = pts.join(" ");
  const fill = `${pts.join(" ")} ${pad + w},${pad + h} ${pad},${pad + h}`;
  const color = positive ? "#22C55E" : "#EF4444";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="efill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#efill)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ExplorerPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [selected, setSelected] = useState<string>("gold");
  const [range, setRange] = useState<Range>("1M");
  const { has, add, remove, get } = useWatchlist();
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQty, setBuyQty] = useState("1");
  const [showWatchlistForm, setShowWatchlistForm] = useState(false);

  const commodity = commodities.find(c => c.id === selected);
  const positive = (commodity?.changePercent ?? 0) >= 0;
  const volatility = commodity ? calcVolatility(commodity.history) : "low";
  const inWatchlist = has(selected);
  const watchlistEntry = get(selected);

  const pnl = watchlistEntry && commodity
    ? (commodity.price - watchlistEntry.buyPrice) * watchlistEntry.quantity
    : null;
  const pnlPct = watchlistEntry && commodity
    ? ((commodity.price - watchlistEntry.buyPrice) / watchlistEntry.buyPrice) * 100
    : null;

  const filteredHistory = () => {
    if (!commodity) return [];
    const days = range === "1W" ? 7 : range === "1M" ? 30 : range === "3M" ? 90 : 365;
    return commodity.history.slice(-Math.min(days, commodity.history.length));
  };

  const hist = filteredHistory();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Explorer" />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>

        {/* Sidebar — commodity list */}
        <aside>
          <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: "10px" }}>SELECT COMMODITY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {commodities.map(c => {
              const isActive = c.id === selected;
              const pos = c.changePercent >= 0;
              return (
                <button key={c.id} onClick={() => setSelected(c.id)}
                  style={{ background: isActive ? "var(--surface-orange)" : "var(--bg-card)", border: isActive ? "0.5px solid var(--orange-border)" : "0.5px solid var(--border)", borderRadius: "9px", padding: "10px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s", textAlign: "left" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: isActive ? "var(--orange-bright)" : "var(--text-primary)" }}>{c.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>{c.unit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(c.price, c.currency)}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: pos ? "var(--up)" : "var(--down)" }}>{formatPercent(c.changePercent)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main panel */}
        <div>
          {commodity ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{commodity.name}</h1>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: `${VOLATILITY_COLORS[volatility]}18`, color: VOLATILITY_COLORS[volatility], border: `0.5px solid ${VOLATILITY_COLORS[volatility]}40` }}>{VOLATILITY_LABELS[volatility]} volatility</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{formatPrice(commodity.price, commodity.currency)}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: positive ? "var(--up)" : "var(--down)", background: positive ? "var(--up-dim)" : "var(--down-dim)", padding: "3px 10px", borderRadius: "6px" }}>{formatPercent(commodity.changePercent)} {formatChange(commodity.change, commodity.currency)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>{commodity.unit} · {commodity.currency}</div>
                </div>

                {/* Watchlist button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                  {inWatchlist ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {pnl !== null && (
                        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "9px", padding: "8px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>UNREALISED PnL</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 600, color: pnl >= 0 ? "var(--up)" : "var(--down)" }}>{pnl >= 0 ? "+" : ""}{formatPrice(pnl, commodity.currency)} ({pnlPct?.toFixed(2)}%)</div>
                        </div>
                      )}
                      <button onClick={() => remove(selected)} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "9px", padding: "8px 14px", fontSize: "12px", color: "var(--down)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Remove from watchlist</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setShowWatchlistForm(v => !v)} style={{ background: "var(--orange-mid)", border: "none", borderRadius: "9px", padding: "8px 16px", fontSize: "12px", fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
                        {showWatchlistForm ? "Cancel" : "Add to watchlist"}
                      </button>
                      {showWatchlistForm && (
                        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "12px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                          <div>
                            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "4px" }}>BUY PRICE</div>
                            <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder={String(commodity.price)} style={{ width: "110px", background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)", borderRadius: "7px", padding: "6px 10px", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "4px" }}>QTY</div>
                            <input type="number" value={buyQty} onChange={e => setBuyQty(e.target.value)} style={{ width: "70px", background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)", borderRadius: "7px", padding: "6px 10px", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                          </div>
                          <button onClick={() => { add(selected, parseFloat(buyPrice) || commodity.price, parseFloat(buyQty) || 1); setShowWatchlistForm(false); }} style={{ background: "var(--orange-mid)", border: "none", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Save</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "1.25rem" }}>
                {[
                  { label: "PREV CLOSE", value: formatPrice(commodity.previousClose, commodity.currency), color: "var(--text-primary)" },
                  { label: "24H HIGH",   value: formatPrice(commodity.high24h, commodity.currency),       color: "var(--up)" },
                  { label: "24H LOW",    value: formatPrice(commodity.low24h, commodity.currency),        color: "var(--down)" },
                  { label: "VOLUME",     value: commodity.volume > 0 ? commodity.volume.toLocaleString() : "N/A", color: "var(--text-secondary)" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "9px", padding: "0.75rem 1rem" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "4px" }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 600, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart card */}
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
                {/* Range selector */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>Price History</div>
                  <div style={{ display: "flex", gap: "2px", background: "var(--bg-elevated)", borderRadius: "8px", padding: "3px" }}>
                    {RANGES.map(r => (
                      <button key={r} onClick={() => setRange(r)} style={{ background: range === r ? "var(--orange-mid)" : "transparent", border: "none", borderRadius: "6px", padding: "4px 12px", fontSize: "11px", fontWeight: 500, color: range === r ? "#fff" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-ui)" }}>{r}</button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div style={{ position: "relative", height: "240px", width: "100%" }}>
                  {hist.length > 1 ? (
                    <MiniChart data={hist} positive={positive} width={800} height={240} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-tertiary)", fontSize: "13px" }}>
                      Not enough history data for this range
                    </div>
                  )}
                </div>

                {/* X-axis labels */}
                {hist.length > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    {[0, Math.floor(hist.length / 4), Math.floor(hist.length / 2), Math.floor((hist.length * 3) / 4), hist.length - 1].map(i => (
                      <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
                        {hist[i] ? new Date(hist[i].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* OHLC Table */}
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "1rem" }}>Recent Price Data</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                  <thead>
                    <tr>
                      {["Date", "Close", "Change", "%"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", borderBottom: "0.5px solid var(--border)", fontFamily: "var(--font-ui)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...commodity.history].reverse().slice(0, 10).map((pt, i, arr) => {
                      const prev = arr[i + 1];
                      const chg = prev ? pt.price - prev.price : 0;
                      const chgPct = prev ? (chg / prev.price) * 100 : 0;
                      const pos = chg >= 0;
                      return (
                        <tr key={pt.timestamp} style={{ borderBottom: "0.5px solid var(--border)" }}>
                          <td style={{ padding: "7px 10px", color: "var(--text-secondary)" }}>{new Date(pt.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</td>
                          <td style={{ padding: "7px 10px", color: "var(--text-primary)", fontWeight: 500 }}>{formatPrice(pt.price, commodity.currency)}</td>
                          <td style={{ padding: "7px 10px", color: pos ? "var(--up)" : "var(--down)" }}>{prev ? formatChange(chg, commodity.currency) : "—"}</td>
                          <td style={{ padding: "7px 10px", color: pos ? "var(--up)" : "var(--down)" }}>{prev ? `${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--text-tertiary)" }}>Loading...</div>
          )}
        </div>
      </main>
    </div>
  );
}
