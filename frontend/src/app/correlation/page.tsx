"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";

interface CorrCell { a: string; b: string; name_a: string; name_b: string; corr: number; }
interface CorrData  { ids: string[]; labels: Record<string, string>; matrix: CorrCell[]; }

function corrColor(v: number): string {
  if (v >=  0.7) return "#22C55E";
  if (v >=  0.3) return "#86EFAC";
  if (v >=  -0.3) return "#444440";
  if (v >= -0.7) return "#FCA5A5";
  return "#EF4444";
}

function corrLabel(v: number): string {
  if (v === 1)    return "Self";
  if (v >=  0.7)  return "Strong +";
  if (v >=  0.3)  return "Moderate +";
  if (v >= -0.3)  return "Weak / None";
  if (v >= -0.7)  return "Moderate -";
  return "Strong -";
}

const SHORT: Record<string, string> = {
  "crude-wti":   "WTI",
  "crude-brent": "BRENT",
  "natural-gas": "GAS",
  "gold":        "GOLD",
  "silver":      "SILVER",
  "copper":      "COPPER",
  "aluminium":   "ALUM",
  "platinum":    "PLAT",
};

export default function CorrelationPage() {
  const { isConnected, lastUpdated } = usePrices();
  const [data, setData]       = useState<CorrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<{ a: string; b: string } | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/correlation`)
      .then(r => r.json())
      .then(d => { setData(d?.ids ? d : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getCellValue = (a: string, b: string) =>
    data?.matrix.find(c => c.a === a && c.b === b)?.corr ?? 0;

  const hoveredCell = hovered
    ? data?.matrix.find(c => c.a === hovered.a && c.b === hovered.b)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Correlation" />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Correlation Matrix</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Pearson correlation of 30-day daily price returns between all commodity pairs</p>
        </div>

        {loading ? (
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>Computing correlations...</div>
        ) : data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }}>

            {/* Heatmap */}
            <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.25rem", overflowX: "auto" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: "3px", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "70px" }} />
                    {data.ids.map(id => (
                      <th key={id} style={{ textAlign: "center", padding: "4px 2px", fontSize: "10px", fontWeight: 500, color: "var(--text-tertiary)", fontFamily: "var(--font-ui)", letterSpacing: "0.04em", width: "60px" }}>
                        {SHORT[id] ?? id.substring(0, 5).toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.ids.map(rowId => (
                    <tr key={rowId}>
                      <td style={{ fontSize: "10px", color: "var(--text-tertiary)", paddingRight: "8px", fontFamily: "var(--font-ui)", letterSpacing: "0.04em", textAlign: "right", whiteSpace: "nowrap" }}>
                        {SHORT[rowId] ?? rowId.substring(0, 5).toUpperCase()}
                      </td>
                      {data.ids.map(colId => {
                        const v   = getCellValue(rowId, colId);
                        const bg  = corrColor(v);
                        const isSelf = rowId === colId;
                        const isHov  = hovered?.a === rowId && hovered?.b === colId;
                        return (
                          <td key={colId}
                            onMouseEnter={() => setHovered({ a: rowId, b: colId })}
                            onMouseLeave={() => setHovered(null)}
                            style={{ textAlign: "center", padding: 0, cursor: "pointer" }}>
                            <div style={{
                              width: "54px", height: "44px", borderRadius: "6px",
                              background: isSelf ? "var(--surface-orange)" : bg + (isSelf ? "" : "40"),
                              border: isHov ? "1.5px solid var(--orange-mid)" : isSelf ? "0.5px solid var(--orange-border)" : "0.5px solid transparent",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              transition: "border 0.15s",
                            }}>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, color: isSelf ? "var(--orange-mid)" : "var(--text-primary)" }}>
                                {isSelf ? "1.00" : v.toFixed(2)}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Hovered cell detail */}
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem", minHeight: "120px" }}>
                {hoveredCell && hoveredCell.a !== hoveredCell.b ? (
                  <>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "8px" }}>PAIR DETAIL</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {data.labels[hoveredCell.a]} vs {data.labels[hoveredCell.b]}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700, color: corrColor(hoveredCell.corr), marginBottom: "4px" }}>
                      {hoveredCell.corr.toFixed(4)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{corrLabel(hoveredCell.corr)} correlation</div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "6px", lineHeight: 1.5 }}>
                      {hoveredCell.corr > 0.7 ? "These commodities move together strongly. Common macro drivers dominate." :
                       hoveredCell.corr > 0.3 ? "Moderate positive relationship. Some shared drivers." :
                       hoveredCell.corr > -0.3 ? "Weak or no consistent relationship between these two." :
                       hoveredCell.corr > -0.7 ? "Moderate negative relationship. Often move in opposite directions." :
                       "Strong negative correlation. These tend to move in opposite directions."}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--text-tertiary)", fontSize: "12px", paddingTop: "1rem" }}>Hover over any cell to see pair details</div>
                )}
              </div>

              {/* Legend */}
              <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem" }}>
                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "10px" }}>LEGEND</div>
                {[
                  { range: "+0.7 to +1.0", label: "Strong positive",   color: "#22C55E" },
                  { range: "+0.3 to +0.7", label: "Moderate positive", color: "#86EFAC" },
                  { range: "-0.3 to +0.3", label: "No correlation",    color: "#444440" },
                  { range: "-0.7 to -0.3", label: "Moderate negative", color: "#FCA5A5" },
                  { range: "-1.0 to -0.7", label: "Strong negative",   color: "#EF4444" },
                ].map(l => (
                  <div key={l.range} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                    <div style={{ width: "28px", height: "18px", borderRadius: "4px", background: l.color + "50", border: `0.5px solid ${l.color}60`, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{l.range}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{l.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interpretation note */}
              <div style={{ background: "var(--surface-orange)", border: "0.5px solid var(--orange-border)", borderRadius: "10px", padding: "10px 12px" }}>
                <div style={{ fontSize: "11px", color: "var(--orange-mid)", lineHeight: 1.6 }}>
                  Based on 30-day rolling daily price returns. Correlation does not imply causation. Use alongside fundamental analysis.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
