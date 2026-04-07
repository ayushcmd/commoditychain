"use client";

import { useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { usePrices } from "@/hooks/usePrices";

const COUNTRY_DATA: Record<string, {
  name: string; topExport: string; topImport: string;
  sensitivity: "low" | "medium" | "high";
  tags: string[]; note: string;
}> = {
  USA: { name: "United States", topExport: "Crude Oil, LNG",   topImport: "Copper, Aluminium", sensitivity: "low",    tags: ["oil"],           note: "World's largest oil producer since 2018." },
  SAU: { name: "Saudi Arabia",  topExport: "Crude Oil",        topImport: "Gold",              sensitivity: "low",    tags: ["oil"],           note: "OPEC leader. Controls ~12% of global oil supply." },
  RUS: { name: "Russia",        topExport: "Crude Oil, Gas",   topImport: "Aluminium",         sensitivity: "low",    tags: ["oil", "gold"],   note: "2nd largest oil exporter. Also major gold producer." },
  CHN: { name: "China",         topExport: "Copper products",  topImport: "Crude Oil, Gold",   sensitivity: "high",   tags: ["copper"],        note: "Consumes 55% of global copper and 25% of global oil." },
  IND: { name: "India",         topExport: "Refined Products", topImport: "Crude Oil, Gold",   sensitivity: "high",   tags: [],                note: "Imports 85% of crude. 2nd largest gold consumer globally." },
  AUS: { name: "Australia",     topExport: "Coal, Gold",       topImport: "Crude Oil",         sensitivity: "low",    tags: ["gold", "copper"],note: "Top coal and gold exporter. Major copper producer." },
  CHL: { name: "Chile",         topExport: "Copper",           topImport: "Crude Oil",         sensitivity: "low",    tags: ["copper"],        note: "World's largest copper producer — 28% of global supply." },
  ZAF: { name: "South Africa",  topExport: "Platinum, Gold",   topImport: "Crude Oil",         sensitivity: "medium", tags: ["gold"],          note: "Largest platinum producer globally." },
  CAN: { name: "Canada",        topExport: "Crude Oil, Gas",   topImport: "Aluminium",         sensitivity: "low",    tags: ["oil", "gold"],   note: "Major oil sands producer. Exports heavily to US." },
  BRA: { name: "Brazil",        topExport: "Iron Ore, Oil",    topImport: "Copper",            sensitivity: "medium", tags: ["oil"],           note: "Growing deepwater oil producer and iron ore exporter." },
  IRN: { name: "Iran",          topExport: "Crude Oil",        topImport: "Gold",              sensitivity: "low",    tags: ["oil", "copper"], note: "Top 5 oil producer under heavy sanctions." },
  NGA: { name: "Nigeria",       topExport: "Crude Oil",        topImport: "Refined Products",  sensitivity: "medium", tags: ["oil"],           note: "Africa's largest oil producer." },
  DEU: { name: "Germany",       topExport: "Manufactured",     topImport: "Crude Oil, Gas",    sensitivity: "high",   tags: [],                note: "Major industrial consumer. No domestic oil or gas." },
  JPN: { name: "Japan",         topExport: "Manufactured",     topImport: "Crude Oil, LNG",    sensitivity: "high",   tags: [],                note: "Almost entirely import-dependent for energy." },
  PER: { name: "Peru",          topExport: "Copper, Gold",     topImport: "Crude Oil",         sensitivity: "low",    tags: ["gold", "copper"],note: "2nd largest copper producer globally." },
  GBR: { name: "United Kingdom",topExport: "North Sea Oil",    topImport: "Gold",              sensitivity: "medium", tags: ["oil"],           note: "Declining North Sea producer. London is gold trading hub." },
  ARE: { name: "UAE",           topExport: "Crude Oil, Gas",   topImport: "Gold",              sensitivity: "low",    tags: ["oil"],           note: "OPEC member. Dubai is major gold re-export hub." },
  IDN: { name: "Indonesia",     topExport: "Coal, Copper",     topImport: "Crude Oil",         sensitivity: "medium", tags: ["gold", "copper"],note: "World's top thermal coal exporter." },
  KAZ: { name: "Kazakhstan",    topExport: "Crude Oil",        topImport: "Manufactured",      sensitivity: "low",    tags: ["oil", "gold"],   note: "Major Caspian oil and gold producer." },
  COD: { name: "DR Congo",      topExport: "Copper, Cobalt",   topImport: "Crude Oil",         sensitivity: "medium", tags: ["copper"],        note: "World's largest cobalt producer." },
};

const SENS_COLOR: Record<string, string> = {
  high: "#DC2626", medium: "#D97706", low: "#16A34A",
};

const FILTERS = [
  { id: "all",    label: "All Countries" },
  { id: "oil",    label: "Oil Producers" },
  { id: "gold",   label: "Gold Producers" },
  { id: "copper", label: "Copper Producers" },
  { id: "import", label: "High Import Dep." },
];

const NUM_TO_ISO: Record<string, string> = {
  "840":"USA","682":"SAU","643":"RUS","156":"CHN","356":"IND",
  "036":"AUS","152":"CHL","710":"ZAF","124":"CAN","076":"BRA",
  "364":"IRN","566":"NGA","276":"DEU","392":"JPN","604":"PER",
  "826":"GBR","784":"ARE","360":"IDN","398":"KAZ","180":"COD",
};

function isVisible(iso: string, filter: string): boolean {
  const info = COUNTRY_DATA[iso];
  if (!info) return false;
  if (filter === "all") return true;
  if (filter === "import") return info.sensitivity === "high";
  return info.tags.includes(filter);
}

export default function MapPage() {
  const { isConnected, lastUpdated } = usePrices();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [filter,   setFilter]   = useState("all");
  const [ready,    setReady]    = useState(false);

  // Re-run map whenever filter changes
  useEffect(() => {
    let cancelled = false;
    async function loadMap() {
      try {
        const [d3geo, topo, world] = await Promise.all([
          import("d3-geo"),
          import("topojson-client"),
          fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json()),
        ]);
        if (cancelled || !svgRef.current) return;
        const svg = svgRef.current;
        const W = svg.clientWidth || 760, H = 420;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        const proj = d3geo.geoNaturalEarth1().scale(148).translate([W/2, H/2]);
        const path = d3geo.geoPath().projection(proj);

        const bg = document.createElementNS("http://www.w3.org/2000/svg","rect");
        bg.setAttribute("width",String(W)); bg.setAttribute("height",String(H)); bg.setAttribute("fill","#0A0F1A");
        svg.appendChild(bg);

        const grat = d3geo.geoGraticule()();
        const gratEl = document.createElementNS("http://www.w3.org/2000/svg","path");
        gratEl.setAttribute("d", path(grat)??""); gratEl.setAttribute("fill","none");
        gratEl.setAttribute("stroke","#ffffff08"); gratEl.setAttribute("stroke-width","0.5");
        svg.appendChild(gratEl);

        const countries = (topo.feature as any)(world, world.objects.countries) as any;

        for (const f of countries.features) {
          const numId = String(f.id).padStart(3,"0");
          const iso   = NUM_TO_ISO[numId];
          const info  = iso ? COUNTRY_DATA[iso] : null;
          const d     = path(f) ?? "";
          if (!d) continue;

          const el = document.createElementNS("http://www.w3.org/2000/svg","path");
          el.setAttribute("d", d);

          const visible = iso ? isVisible(iso, filter) : false;

          if (info && iso && visible) {
            // Fully colored — matches filter
            el.setAttribute("fill", SENS_COLOR[info.sensitivity]+"55");
            el.setAttribute("stroke","#ffffff15");
            el.setAttribute("stroke-width","0.4");
            el.style.cursor = "pointer";
            el.addEventListener("mouseenter",() => {
              el.setAttribute("fill", SENS_COLOR[info.sensitivity]+"AA");
              el.setAttribute("stroke","#F07B00"); el.setAttribute("stroke-width","1.2");
              if (!cancelled) setHovered(iso);
            });
            el.addEventListener("mouseleave",() => {
              el.setAttribute("fill", SENS_COLOR[info.sensitivity]+"55");
              el.setAttribute("stroke","#ffffff15"); el.setAttribute("stroke-width","0.4");
              if (!cancelled) setHovered(null);
            });
            el.addEventListener("click",() => { if (!cancelled) setSelected(p => p===iso ? null : iso); });
          } else if (info && iso && !visible) {
            // Dimmed — doesn't match filter
            el.setAttribute("fill", "#1A1F2E");
            el.setAttribute("stroke","#ffffff08");
            el.setAttribute("stroke-width","0.4");
          } else {
            // No data country
            el.setAttribute("fill","#1A1F2E");
            el.setAttribute("stroke","#ffffff15");
            el.setAttribute("stroke-width","0.4");
          }

          svg.appendChild(el);
        }

        // Country labels — only show visible ones
        for (const [numId, iso] of Object.entries(NUM_TO_ISO)) {
          const feat = countries.features.find((f:any) => String(f.id).padStart(3,"0") === numId);
          if (!feat) continue;
          const c = path.centroid(feat);
          if (!c || isNaN(c[0])) continue;
          const visible = isVisible(iso, filter);
          const t = document.createElementNS("http://www.w3.org/2000/svg","text");
          t.setAttribute("x",String(c[0])); t.setAttribute("y",String(c[1]));
          t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
          t.setAttribute("font-size","8"); t.setAttribute("font-family","Outfit,sans-serif");
          t.setAttribute("fill", visible ? "#ffffffA0" : "#ffffff30");
          t.setAttribute("pointer-events","none");
          t.textContent = iso;
          svg.appendChild(t);
        }

        if (!cancelled) setReady(true);
      } catch(e) { console.error("Map error:",e); }
    }
    loadMap();
    return () => { cancelled = true; };
  }, [filter]); // ← filter dependency added

  const display     = selected ? COUNTRY_DATA[selected] : hovered ? COUNTRY_DATA[hovered] : null;
  const displayCode = selected ?? hovered;

  return (
    <>
      <Topbar title="Global Map" subtitle="Commodity trade by country" isConnected={isConnected} lastUpdated={lastUpdated} />
      <div className="app-content">
        <div style={{ marginBottom:"1.25rem" }}>
          <h1 style={{ fontSize:"22px",fontWeight:700,color:"var(--text-1)",letterSpacing:"-0.03em",marginBottom:"3px" }}>Global Commodity Map</h1>
          <p style={{ fontSize:"13px",color:"var(--text-2)" }}>Click any country for its commodity profile</p>
        </div>
        <div style={{ display:"flex",gap:"6px",marginBottom:"1rem",flexWrap:"wrap" }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setSelected(null); setHovered(null); }}
              style={{ background:filter===f.id?"var(--orange-mid)":"var(--bg-card)", border:filter===f.id?"none":"0.5px solid var(--border)", borderRadius:"20px",padding:"5px 14px",fontSize:"12px",fontWeight:500,color:filter===f.id?"#fff":"var(--text-2)",cursor:"pointer",fontFamily:"var(--font-ui)" }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:"14px" }}>
          <div className="card" style={{ padding:0,overflow:"hidden",position:"relative" }}>
            {!ready && (
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:"13px",background:"var(--bg-card)",zIndex:2 }}>
                Loading map...
              </div>
            )}
            <svg ref={svgRef} style={{ width:"100%",height:"420px",display:"block" }} />
            <div style={{ position:"absolute",bottom:"12px",left:"14px",display:"flex",flexDirection:"column",gap:"5px" }}>
              {[["#16A34A","Low import dep."],["#D97706","Medium"],["#DC2626","High import dep."]].map(([col,lbl]) => (
                <div key={lbl} style={{ display:"flex",alignItems:"center",gap:"6px" }}>
                  <div style={{ width:"10px",height:"10px",borderRadius:"2px",background:col+"80",border:`0.5px solid ${col}` }} />
                  <span style={{ fontSize:"9px",color:"#ffffffA0",fontFamily:"Outfit,sans-serif" }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding:"1.25rem" }}>
            {display && displayCode ? (
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px" }}>
                  <div>
                    <div style={{ fontSize:"15px",fontWeight:700,color:"var(--text-1)",marginBottom:"4px" }}>{display.name}</div>
                    <span style={{ fontSize:"10px",padding:"2px 8px",borderRadius:"20px",background:SENS_COLOR[display.sensitivity]+"18",color:SENS_COLOR[display.sensitivity],border:`0.5px solid ${SENS_COLOR[display.sensitivity]}40` }}>
                      {display.sensitivity} sensitivity
                    </span>
                  </div>
                  {selected && <button onClick={() => setSelected(null)} style={{ background:"transparent",border:"0.5px solid var(--border)",borderRadius:"6px",padding:"3px 8px",fontSize:"10px",color:"var(--text-3)",cursor:"pointer",fontFamily:"var(--font-ui)" }}>Close</button>}
                </div>
                <p style={{ fontSize:"12px",color:"var(--text-2)",lineHeight:1.65,marginBottom:"1rem",borderLeft:"2px solid var(--orange-mid)",paddingLeft:"10px" }}>{display.note}</p>
                {[{label:"Top Export",value:display.topExport},{label:"Top Import",value:display.topImport}].map(s => (
                  <div key={s.label} style={{ background:"var(--bg-elevated)",borderRadius:"8px",padding:"8px 12px",marginBottom:"6px" }}>
                    <div style={{ fontSize:"9px",color:"var(--text-3)",letterSpacing:"0.07em",marginBottom:"3px" }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontSize:"12px",fontWeight:500,color:"var(--text-1)" }}>{s.value}</div>
                  </div>
                ))}
                <div style={{ display:"flex",gap:"5px",flexWrap:"wrap",marginTop:"8px" }}>
                  {display.tags.map(t => (
                    <span key={t} style={{ fontSize:"10px",padding:"2px 8px",borderRadius:"20px",background:"var(--orange-glow)",color:"var(--orange-bright)",border:"0.5px solid var(--orange-border)" }}>{t} producer</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:"8px",padding:"3rem 1rem" }}>
                <div style={{ fontSize:"13px",color:"var(--text-3)" }}>Click or hover a country</div>
                <div style={{ fontSize:"11px",color:"var(--text-3)",lineHeight:1.6 }}>{Object.keys(COUNTRY_DATA).length} countries mapped</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}