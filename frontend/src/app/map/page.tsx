"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";

interface CountryProfile {
  name: string;
  code: string;
  topExport: string;
  topImport: string;
  oilProducer: boolean;
  goldProducer: boolean;
  copperProducer: boolean;
  sensitivity: "low" | "medium" | "high";
  note: string;
}

const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  USA:  { name: "United States", code: "USA", topExport: "Crude Oil, LNG", topImport: "Copper, Aluminium", oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "low",    note: "World's largest oil producer since 2018. Major shale exporter." },
  SAU:  { name: "Saudi Arabia",  code: "SAU", topExport: "Crude Oil",      topImport: "Gold, Silver",      oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "low",    note: "OPEC leader. Controls ~12% of global oil supply." },
  RUS:  { name: "Russia",        code: "RUS", topExport: "Crude Oil, Gas",  topImport: "Aluminium",         oilProducer: true,  goldProducer: true,  copperProducer: false, sensitivity: "low",    note: "2nd largest oil exporter. Also major gold and natural gas producer." },
  CHN:  { name: "China",         code: "CHN", topExport: "Copper products", topImport: "Crude Oil, Gold",   oilProducer: false, goldProducer: true,  copperProducer: false, sensitivity: "high",   note: "Consumes 55% of global copper and 25% of global oil. Key demand driver." },
  IND:  { name: "India",         code: "IND", topExport: "Refined Products",topImport: "Crude Oil, Gold",   oilProducer: false, goldProducer: false, copperProducer: false, sensitivity: "high",   note: "Imports 85% of crude needs. 2nd largest gold consumer. Major refiner." },
  AUS:  { name: "Australia",     code: "AUS", topExport: "Coal, Gold",      topImport: "Crude Oil",         oilProducer: false, goldProducer: true,  copperProducer: true,  sensitivity: "low",    note: "Top coal and gold exporter. Also major copper and iron ore producer." },
  CHL:  { name: "Chile",         code: "CHL", topExport: "Copper",          topImport: "Crude Oil",         oilProducer: false, goldProducer: false, copperProducer: true,  sensitivity: "low",    note: "World's largest copper producer — controls ~28% of global supply." },
  ZAF:  { name: "South Africa",  code: "ZAF", topExport: "Platinum, Gold",  topImport: "Crude Oil",         oilProducer: false, goldProducer: true,  copperProducer: false, sensitivity: "medium", note: "Largest platinum producer. Major gold and chromium exporter." },
  CAN:  { name: "Canada",        code: "CAN", topExport: "Crude Oil, Gas",  topImport: "Aluminium",         oilProducer: true,  goldProducer: true,  copperProducer: false, sensitivity: "low",    note: "Largest oil sands producer. Exports heavily to the US." },
  BRA:  { name: "Brazil",        code: "BRA", topExport: "Iron Ore, Oil",   topImport: "Copper",            oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "medium", note: "Growing deepwater oil producer. Major iron ore and soybean exporter." },
  IRN:  { name: "Iran",          code: "IRN", topExport: "Crude Oil",       topImport: "Gold",              oilProducer: true,  goldProducer: false, copperProducer: true,  sensitivity: "low",    note: "Top 5 oil producer but under heavy sanctions restricting exports." },
  NGA:  { name: "Nigeria",       code: "NGA", topExport: "Crude Oil",       topImport: "Refined Products",  oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "medium", note: "Africa's largest oil producer. Economy heavily dependent on oil revenues." },
  DEU:  { name: "Germany",       code: "DEU", topExport: "Manufactured",    topImport: "Crude Oil, Gas",    oilProducer: false, goldProducer: false, copperProducer: false, sensitivity: "high",   note: "Major industrial consumer of energy and metals. No domestic oil or gas." },
  JPN:  { name: "Japan",         code: "JPN", topExport: "Manufactured",    topImport: "Crude Oil, LNG",    oilProducer: false, goldProducer: false, copperProducer: false, sensitivity: "high",   note: "Almost entirely import-dependent for energy. Major LNG buyer." },
  PER:  { name: "Peru",          code: "PER", topExport: "Copper, Gold",    topImport: "Crude Oil",         oilProducer: false, goldProducer: true,  copperProducer: true,  sensitivity: "low",    note: "2nd largest copper producer. Also major gold and zinc exporter." },
  GBR:  { name: "United Kingdom",code: "GBR", topExport: "North Sea Oil",   topImport: "Gold",              oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "medium", note: "Declining North Sea oil producer. London is global gold trading hub." },
  ARE:  { name: "UAE",           code: "ARE", topExport: "Crude Oil, Gas",  topImport: "Gold",              oilProducer: true,  goldProducer: false, copperProducer: false, sensitivity: "low",    note: "OPEC member. Dubai is major gold re-export hub." },
  IDN:  { name: "Indonesia",     code: "IDN", topExport: "Coal, Copper",    topImport: "Crude Oil",         oilProducer: false, goldProducer: true,  copperProducer: true,  sensitivity: "medium", note: "World's top thermal coal exporter. Also major copper and gold producer." },
};

const SENSITIVITY_COLOR: Record<string, string> = {
  high:   "#EF4444",
  medium: "#F59E0B",
  low:    "#22C55E",
};

// Simplified SVG world map — using simplified country paths
const COUNTRY_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  USA: { x: 80,  y: 130, w: 140, h: 80  },
  CAN: { x: 80,  y: 60,  w: 140, h: 70  },
  MEX: { x: 100, y: 205, w: 70,  h: 50  },
  BRA: { x: 195, y: 230, w: 90,  h: 100 },
  CHL: { x: 175, y: 290, w: 30,  h: 90  },
  PER: { x: 155, y: 240, w: 45,  h: 60  },
  GBR: { x: 365, y: 85,  w: 25,  h: 30  },
  DEU: { x: 390, y: 90,  w: 30,  h: 35  },
  RUS: { x: 450, y: 55,  w: 185, h: 80  },
  SAU: { x: 455, y: 185, w: 70,  h: 50  },
  IRN: { x: 490, y: 160, w: 55,  h: 45  },
  ARE: { x: 510, y: 195, w: 30,  h: 25  },
  NGA: { x: 380, y: 215, w: 45,  h: 45  },
  ZAF: { x: 400, y: 300, w: 50,  h: 50  },
  IND: { x: 545, y: 175, w: 70,  h: 70  },
  CHN: { x: 590, y: 120, w: 110, h: 90  },
  JPN: { x: 705, y: 115, w: 40,  h: 50  },
  IDN: { x: 625, y: 235, w: 90,  h: 40  },
  AUS: { x: 640, y: 275, w: 110, h: 90  },
};

const FILTER_OPTIONS = [
  { id: "all",    label: "All Countries",    color: "#D46A00" },
  { id: "oil",    label: "Oil Producers",    color: "#F07B00" },
  { id: "gold",   label: "Gold Producers",   color: "#F5C542" },
  { id: "copper", label: "Copper Producers", color: "#C87533" },
  { id: "import", label: "High Import Dep.", color: "#EF4444" },
];

export default function MapPage() {
  const { isConnected, lastUpdated } = usePrices();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter]     = useState("all");
  const [hovered, setHovered]   = useState<string | null>(null);

  const selectedProfile = selected ? COUNTRY_PROFILES[selected] : null;

  const isVisible = (code: string): boolean => {
    const p = COUNTRY_PROFILES[code];
    if (!p) return true;
    if (filter === "oil")    return p.oilProducer;
    if (filter === "gold")   return p.goldProducer;
    if (filter === "copper") return p.copperProducer;
    if (filter === "import") return p.sensitivity === "high";
    return true;
  };

  const getColor = (code: string): string => {
    const p = COUNTRY_PROFILES[code];
    if (!p) return "#1F1F1F";
    if (hovered === code || selected === code) return "#D46A00";
    if (!isVisible(code)) return "#161616";
    return SENSITIVITY_COLOR[p.sensitivity] + "50";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Map" />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Global Commodity Map</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Top producers and import-dependent economies — click any country for its profile</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ background: filter === f.id ? f.color : "var(--bg-card)", border: filter === f.id ? "none" : "0.5px solid var(--border)", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: 500, color: filter === f.id ? "#fff" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-ui)" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
          {/* Map SVG */}
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1rem", overflow: "hidden" }}>
            <svg viewBox="0 0 800 400" width="100%" style={{ display: "block" }}>
              {/* Ocean background */}
              <rect width="800" height="400" fill="#0A0F1A" rx="8" />

              {/* Grid lines */}
              {[100, 200, 300].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#ffffff08" strokeWidth="0.5" />)}
              {[160, 320, 480, 640].map(x => <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="#ffffff08" strokeWidth="0.5" />)}

              {/* Countries */}
              {Object.entries(COUNTRY_POSITIONS).map(([code, pos]) => {
                const profile = COUNTRY_PROFILES[code];
                const fill = getColor(code);
                const isActive = isVisible(code) && !!profile;
                return (
                  <g key={code}
                    style={{ cursor: isActive ? "pointer" : "default" }}
                    onClick={() => isActive && setSelected(selected === code ? null : code)}
                    onMouseEnter={() => isActive && setHovered(code)}
                    onMouseLeave={() => setHovered(null)}>
                    <rect
                      x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                      rx="4" fill={fill}
                      stroke={selected === code ? "#D46A00" : hovered === code ? "#D46A00" : "#ffffff15"}
                      strokeWidth={selected === code ? 1.5 : 0.5}
                      style={{ transition: "fill 0.2s, stroke 0.2s" }}
                    />
                    {profile && isVisible(code) && (
                      <text
                        x={pos.x + pos.w / 2} y={pos.y + pos.h / 2}
                        textAnchor="middle" dominantBaseline="central"
                        fontSize={pos.w > 80 ? "9" : "8"}
                        fontFamily="var(--font-ui)"
                        fill={selected === code || hovered === code ? "#fff" : "#ffffff80"}
                        fontWeight={selected === code ? "600" : "400"}
                        style={{ pointerEvents: "none", transition: "fill 0.2s" }}>
                        {code}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend */}
              <g>
                {[
                  { color: "#22C55E50", label: "Low import dep." },
                  { color: "#F59E0B50", label: "Medium" },
                  { color: "#EF444450", label: "High import dep." },
                ].map((l, i) => (
                  <g key={i} transform={`translate(16, ${320 + i * 20})`}>
                    <rect width="12" height="12" rx="2" fill={l.color} stroke="#ffffff20" strokeWidth="0.5" />
                    <text x="18" y="9" fontSize="9" fontFamily="var(--font-ui)" fill="#ffffff60">{l.label}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Country profile panel */}
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.25rem" }}>
            {selectedProfile ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{selectedProfile.name}</div>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: `${SENSITIVITY_COLOR[selectedProfile.sensitivity]}18`, color: SENSITIVITY_COLOR[selectedProfile.sensitivity], fontWeight: 500 }}>
                      {selectedProfile.sensitivity} import sensitivity
                    </span>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Close</button>
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "1rem", borderLeft: "2px solid var(--orange-mid)", paddingLeft: "10px" }}>{selectedProfile.note}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Top Export",  value: selectedProfile.topExport },
                    { label: "Top Import",  value: selectedProfile.topImport },
                  ].map(item => (
                    <div key={item.label} style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "8px 12px" }}>
                      <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "3px" }}>{item.label.toUpperCase()}</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                  {selectedProfile.oilProducer    && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#F07B0018", color: "#F07B00", border: "0.5px solid #F07B0040" }}>Oil producer</span>}
                  {selectedProfile.goldProducer   && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#F5C54218", color: "#F5C542", border: "0.5px solid #F5C54240" }}>Gold producer</span>}
                  {selectedProfile.copperProducer && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#C8753318", color: "#C87533", border: "0.5px solid #C8753340" }}>Copper producer</span>}
                </div>
              </>
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "8px", padding: "2rem 0" }}>
                <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Click any highlighted country</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>See its commodity profile, top exports, import dependency, and market role</div>
                <div style={{ marginTop: "1rem", fontSize: "11px", color: "var(--text-tertiary)" }}>{Object.keys(COUNTRY_PROFILES).length} countries mapped</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
