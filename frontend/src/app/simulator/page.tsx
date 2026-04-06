"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { formatPrice } from "@/lib/utils";

interface MetricResult {
  key: string; label: string; unit: string; direction: string;
  baseline: number; shocked: number; delta: number; delta_pct: number;
}
interface SimResult {
  commodity_id: string; base_price: number; shock_price: number;
  price_change: number; price_change_pct: number; metrics: MetricResult[];
}

const SIM_COMMODITIES = ["crude-wti", "crude-brent", "natural-gas", "gold"];

const METRIC_ICONS: Record<string, string> = {
  india_retail_petrol_inr:  "Petrol",
  india_retail_diesel_inr:  "Diesel",
  cpi_inflation_pct:         "Inflation",
  trade_deficit_usd_bn:      "Trade Deficit",
  inr_usd_rate:              "INR/USD",
  fiscal_deficit_gdp_pct:    "Fiscal Deficit",
};

function Bar({ baseline, shocked, isPositive }: { baseline: number; shocked: number; isPositive: boolean }) {
  const max = Math.max(baseline, shocked) * 1.15;
  const bPct = (baseline / max) * 100;
  const sPct = (shocked  / max) * 100;
  return (
    <div style={{ position: "relative", height: "6px", background: "var(--bg-elevated)", borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, height: "100%", width: `${bPct}%`, background: "var(--text-tertiary)", borderRadius: "3px", opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 0, height: "100%", width: `${sPct}%`, background: isPositive ? "var(--down)" : "var(--up)", borderRadius: "3px", transition: "width 0.4s ease" }} />
    </div>
  );
}

export default function SimulatorPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [selectedId, setSelectedId] = useState("crude-wti");
  const [shockPrice, setShockPrice] = useState<number | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const commodity = commodities.find(c => c.id === selectedId);
  const basePrice = commodity?.price ?? 82.5;

  // Init shock price when commodity loads
  useEffect(() => {
    if (commodity && shockPrice === null) {
      setShockPrice(Math.round(commodity.price));
    }
  }, [commodity]);

  // Reset shock price on commodity switch
  useEffect(() => {
    if (commodity) setShockPrice(Math.round(commodity.price));
  }, [selectedId]);

  const runSim = useCallback(async (shock: number) => {
    if (!commodity) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commodity_id: selectedId, base_price: basePrice, shock_price: shock }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [commodity, selectedId, basePrice]);

  useEffect(() => {
    if (shockPrice !== null) {
      const t = setTimeout(() => runSim(shockPrice), 300);
      return () => clearTimeout(t);
    }
  }, [shockPrice, runSim]);

  const sliderMin = Math.floor(basePrice * 0.5);
  const sliderMax = Math.ceil(basePrice * 1.8);
  const priceChange = shockPrice !== null ? shockPrice - basePrice : 0;
  const priceChangePct = basePrice ? (priceChange / basePrice) * 100 : 0;
  const isIncrease = priceChange >= 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Simulator" />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Shock Simulator</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Drag the price slider — see projected impact on India macro metrics in real time</p>
        </div>

        {/* Commodity selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {SIM_COMMODITIES.map(id => {
            const com = commodities.find(c => c.id === id);
            const active = selectedId === id;
            return (
              <button key={id} onClick={() => setSelectedId(id)}
                style={{ background: active ? "var(--surface-orange)" : "var(--bg-card)", border: active ? "0.5px solid var(--orange-border)" : "0.5px solid var(--border)", borderRadius: "9px", padding: "8px 16px", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-ui)" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, color: active ? "var(--orange-bright)" : "var(--text-primary)" }}>{com?.name ?? id}</div>
                {com && <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-tertiary)", marginTop: "1px" }}>{formatPrice(com.price)}</div>}
              </button>
            );
          })}
        </div>

        {/* Price slider card */}
        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "4px" }}>BASE PRICE (CURRENT)</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: "var(--text-primary)" }}>{formatPrice(basePrice)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "4px" }}>PRICE CHANGE</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 600, color: isIncrease ? "var(--down)" : "var(--up)" }}>
                {isIncrease ? "+" : ""}{formatPrice(priceChange)} ({priceChangePct.toFixed(1)}%)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "4px" }}>SHOCK PRICE</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: isIncrease ? "var(--down)" : "var(--up)" }}>
                {shockPrice !== null ? formatPrice(shockPrice) : "—"}
              </div>
            </div>
          </div>

          {/* Slider */}
          <div style={{ padding: "0 4px" }}>
            <input type="range" min={sliderMin} max={sliderMax} step={0.5}
              value={shockPrice ?? basePrice}
              onChange={e => setShockPrice(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--orange-mid)", height: "6px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>{formatPrice(sliderMin)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>Base: {formatPrice(basePrice)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>{formatPrice(sliderMax)}</span>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", gap: "6px", marginTop: "1rem", flexWrap: "wrap" }}>
            {[-30, -20, -10, 0, +10, +20, +30, +50].map(pct => (
              <button key={pct} onClick={() => setShockPrice(Math.round(basePrice * (1 + pct / 100) * 100) / 100)}
                style={{ background: pct === 0 ? "var(--surface-orange)" : "var(--bg-elevated)", border: pct === 0 ? "0.5px solid var(--orange-border)" : "0.5px solid var(--border)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 500, color: pct < 0 ? "var(--up)" : pct > 0 ? "var(--down)" : "var(--orange-mid)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
                {pct === 0 ? "Reset" : `${pct > 0 ? "+" : ""}${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics grid */}
        {result && (
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "10px", fontFamily: "var(--font-mono)" }}>
              India macro impact — {isIncrease ? "price increase" : "price drop"} scenario
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {result.metrics.map(m => {
                const worse = m.delta > 0; // for all our metrics, increase = worse
                return (
                  <div key={m.key} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1rem 1.1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>{m.label}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "1px" }}>{m.unit}</div>
                      </div>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: worse && isIncrease ? "var(--down-dim)" : !worse && !isIncrease ? "var(--up-dim)" : "var(--bg-elevated)", color: worse && isIncrease ? "var(--down)" : !worse && !isIncrease ? "var(--up)" : "var(--text-tertiary)", fontWeight: 500 }}>
                        {m.delta >= 0 ? "+" : ""}{m.delta_pct.toFixed(2)}%
                      </span>
                    </div>

                    <Bar baseline={m.baseline} shocked={m.shocked} isPositive={isIncrease} />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      <div>
                        <div style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "2px" }}>BASELINE</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{m.baseline.toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "2px" }}>PROJECTED</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: worse && isIncrease ? "var(--down)" : "var(--up)" }}>{m.shocked.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "1rem", textAlign: "right" }}>
              Projections based on pre-estimated regression coefficients. For educational purposes only.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
