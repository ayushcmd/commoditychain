"use client";

import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { useWatchlist } from "@/hooks/useWatchlist";
import { formatPrice, formatPercent } from "@/lib/utils";

export default function WatchlistPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const { items, remove } = useWatchlist();

  const entries = items.map(item => {
    const com = commodities.find(c => c.id === item.commodityId);
    if (!com) return null;
    const pnl    = (com.price - item.buyPrice) * item.quantity;
    const pnlPct = ((com.price - item.buyPrice) / item.buyPrice) * 100;
    return { ...item, com, pnl, pnlPct };
  }).filter(Boolean) as NonNullable<ReturnType<typeof items.map>[number]>[];

  const totalPnl = entries.reduce((acc, e) => acc + (e as any).pnl, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Watchlist" />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Watchlist</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Track hypothetical positions — stored locally on your device</p>
          </div>
          {entries.length > 0 && (
            <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "10px 16px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "3px" }}>TOTAL PnL</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: totalPnl >= 0 ? "var(--up)" : "var(--down)" }}>
                {totalPnl >= 0 ? "+" : ""}{formatPrice(totalPnl)}
              </div>
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "var(--text-tertiary)", marginBottom: "8px" }}>No positions yet</div>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Go to the Explorer, select a commodity and click "Add to watchlist"</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(entries as any[]).map(e => {
              const pos = e.pnl >= 0;
              return (
                <div key={e.commodityId} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem 1.25rem", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", alignItems: "center", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{e.com.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>Added {new Date(e.addedAt).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>BUY PRICE</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{formatPrice(e.buyPrice)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>CURRENT</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{formatPrice(e.com.price)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>QTY</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{e.quantity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>PnL</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: pos ? "var(--up)" : "var(--down)" }}>
                      {pos ? "+" : ""}{formatPrice(e.pnl)}<br />
                      <span style={{ fontSize: "11px", opacity: 0.85 }}>{formatPercent(e.pnlPct)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(e.commodityId)}
                    style={{ background: "transparent", border: "0.5px solid var(--border)", borderRadius: "7px", padding: "5px 12px", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "color 0.15s, border-color 0.15s" }}
                    onMouseEnter={e2 => { e2.currentTarget.style.color = "var(--down)"; e2.currentTarget.style.borderColor = "var(--down)"; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.color = "var(--text-tertiary)"; e2.currentTarget.style.borderColor = "var(--border)"; }}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
