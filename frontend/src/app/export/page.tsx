"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { formatPrice, formatPercent } from "@/lib/utils";

export default function ExportPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [downloading, setDownloading] = useState<string | null>(null);

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const download = async (url: string, filename: string) => {
    setDownloading(filename);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--orange-mid)" : "var(--bg-elevated)",
    border: active ? "none" : "0.5px solid var(--border)",
    borderRadius: "7px", padding: "5px 12px", fontSize: "11px", fontWeight: 500,
    color: active ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-ui)",
    transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Export" />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Price History Export</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Download 30-day price history for any commodity as CSV or JSON</p>
        </div>

        {/* Export all */}
        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "3px" }}>All Commodities Snapshot</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Current prices for all {commodities.length} commodities in one file</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => download(`${BASE}/api/export?format=csv`, "commoditychain-all.csv")}
                style={btnStyle(false)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--orange-mid)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                CSV
              </button>
              <button onClick={() => download(`${BASE}/api/export?format=json`, "commoditychain-all.json")}
                style={btnStyle(false)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--orange-mid)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Per commodity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {commodities.map(c => {
            const isPos = c.changePercent >= 0;
            const key   = c.id;
            return (
              <div key={c.id} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>{c.name}</div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{formatPrice(c.price, c.currency)}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: isPos ? "var(--up)" : "var(--down)" }}>{formatPercent(c.changePercent)}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{c.history.length} data points</span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{c.unit}</span>
                  </div>
                </div>

                {/* Download buttons */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => download(`${BASE}/api/export/${c.id}?format=csv`, `${c.id}-prices.csv`)}
                    disabled={downloading === `${c.id}-csv`}
                    style={btnStyle(downloading === `${key}-csv`)}
                    onMouseEnter={e => { if (!downloading) { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--orange-mid)"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                    CSV
                  </button>
                  <button
                    onClick={() => download(`${BASE}/api/export/${c.id}?format=json`, `${c.id}-prices.json`)}
                    disabled={downloading === `${c.id}-json`}
                    style={btnStyle(downloading === `${key}-json`)}
                    onMouseEnter={e => { if (!downloading) { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--orange-mid)"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                    JSON
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "1.5rem", textAlign: "center" }}>
          Data reflects 30-day price history from CommodityChain. For educational and research use only.
        </div>
      </main>
    </div>
  );
}
