"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";

interface CityPrice { city: string; state: string; petrol: number; diesel: number; }
interface IndiaData  {
  crude_reference: number; crude_current: number; crude_deviation: number;
  adjustment_inr: number; cities: CityPrice[];
}
interface MacroData {
  macro: Record<string, number>;
  price_breakdown: Record<string, number>;
}

const MACRO_LABELS: Record<string, { label: string; unit: string; prefix?: string }> = {
  gdp_growth_pct:        { label: "GDP Growth",        unit: "% YoY" },
  cpi_inflation_pct:     { label: "CPI Inflation",     unit: "% YoY" },
  wpi_inflation_pct:     { label: "WPI Inflation",     unit: "% YoY" },
  trade_deficit_usd_bn:  { label: "Trade Deficit",     unit: "$ Billion/month" },
  forex_reserves_usd_bn: { label: "Forex Reserves",    unit: "$ Billion", prefix: "$" },
  inr_usd:               { label: "INR / USD",         unit: "INR" },
  crude_import_bn_usd:   { label: "Crude Import Bill", unit: "$ Billion/year" },
  crude_import_share_pct:{ label: "Import Dependency", unit: "% of crude needs" },
};

export default function IndiaPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [indiaData, setIndiaData] = useState<IndiaData | null>(null);
  const [macroData, setMacroData] = useState<MacroData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [sortBy,    setSortBy]    = useState<"city" | "petrol" | "diesel">("petrol");

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/india/prices`).then(r => r.json()),
      fetch(`${BASE}/api/india/macro`).then(r => r.json()),
    ]).then(([prices, macro]) => {
      setIndiaData(prices);
      setMacroData(macro);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sortedCities = indiaData
    ? [...indiaData.cities].sort((a, b) =>
        sortBy === "city" ? a.city.localeCompare(b.city) : b[sortBy] - a[sortBy]
      )
    : [];

  const crude = commodities.find(c => c.id === "crude-wti");
  const adjustment = indiaData?.adjustment_inr ?? 0;
  const isUp       = adjustment >= 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="India" />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>India Price Layer</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>How global crude oil translates to Indian pump prices and macroeconomic indicators</p>
        </div>

        {/* Crude → India impact banner */}
        {indiaData && (
          <div style={{ background: isUp ? "var(--down-dim)" : "var(--up-dim)", border: `0.5px solid ${isUp ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`, borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                Crude WTI is <strong>{isUp ? "above" : "below"}</strong> reference price (${indiaData.crude_reference}/barrel)
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: isUp ? "var(--down)" : "var(--up)" }}>
                {isUp ? "+" : ""}{indiaData.crude_deviation.toFixed(2)} USD/barrel deviation
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>CRUDE NOW</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>${indiaData.crude_current}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>PUMP IMPACT</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 600, color: isUp ? "var(--down)" : "var(--up)" }}>
                  {isUp ? "+" : ""}{adjustment.toFixed(2)} INR/litre
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>

          {/* City prices table */}
          <div>
            <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>City-wise Retail Prices</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {(["city", "petrol", "diesel"] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      style={{ background: sortBy === s ? "var(--orange-mid)" : "transparent", border: sortBy === s ? "none" : "0.5px solid var(--border)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: sortBy === s ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)" }}>Loading prices...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)" }}>
                      {["City", "State", "Petrol (INR/L)", "Diesel (INR/L)"].map(h => (
                        <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", fontWeight: 500, fontFamily: "var(--font-ui)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCities.map((c, i) => (
                      <tr key={c.city} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)" }}>
                        <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{c.city}</td>
                        <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{c.state}</td>
                        <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: isUp ? "var(--down)" : "var(--up)" }}>
                          {c.petrol.toFixed(2)}
                        </td>
                        <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {c.diesel.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--border)", fontSize: "10px", color: "var(--text-tertiary)" }}>
                Prices are indicative estimates based on crude oil price deviation from reference. Actual prices depend on state taxes and revision cycles.
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Tax breakdown */}
            {macroData && (
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px" }}>Delhi Petrol Price Breakdown</div>
                {Object.entries(macroData.price_breakdown).map(([key, val]) => {
                  const labels: Record<string, string> = { base_price: "Base Price", freight: "Freight", excise_duty: "Excise Duty (Central)", dealer_commission: "Dealer Commission", vat: "VAT (State)", total: "Total" };
                  const isTotal = key === "total";
                  const pct = ((val as number) / macroData.price_breakdown.total) * 100;
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: isTotal ? "none" : "0.5px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize: isTotal ? "13px" : "12px", fontWeight: isTotal ? 600 : 400, color: isTotal ? "var(--text-primary)" : "var(--text-secondary)" }}>{labels[key] ?? key}</div>
                        {!isTotal && <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{pct.toFixed(1)}%</div>}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: isTotal ? "14px" : "12px", fontWeight: isTotal ? 700 : 500, color: isTotal ? "var(--orange-mid)" : "var(--text-primary)" }}>
                        {String(val as number)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Macro indicators */}
            {macroData && (
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>India Macro (adjusted for crude)</div>
                {Object.entries(macroData.macro)
                  .filter(([k]) => MACRO_LABELS[k])
                  .map(([key, val]) => {
                    const cfg = MACRO_LABELS[key];
                    return (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid var(--border)" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{cfg.label}</div>
                        <div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                            {cfg.prefix ?? ""}{(val as number).toFixed(1)}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--text-tertiary)", marginLeft: "4px" }}>{cfg.unit}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
