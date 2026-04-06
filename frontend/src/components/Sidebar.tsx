"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";

const NAV = [
  {
    group: "Markets",
    items: [
      { label: "Dashboard",   href: "/",            icon: <DashIcon /> },
      { label: "Explorer",    href: "/explorer",    icon: <ExplorerIcon /> },
      { label: "Map",         href: "/map",         icon: <MapIcon /> },
      { label: "Correlation", href: "/correlation", icon: <CorrIcon /> },
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "Converter",  href: "/converter",  icon: <ConvIcon /> },
      { label: "Watchlist",  href: "/watchlist",  icon: <WatchIcon /> },
      { label: "Alerts",     href: "/alerts",     icon: <AlertIcon /> },
      { label: "Export",     href: "/export",     icon: <ExportIcon /> },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "News",      href: "/news",      icon: <NewsIcon /> },
      { label: "Learn",     href: "/learn",     icon: <LearnIcon /> },
      { label: "Analyst",   href: "/analyst",   icon: <AIIcon /> },
      { label: "Simulator", href: "/simulator", icon: <SimIcon /> },
      { label: "India",     href: "/india",     icon: <IndiaIcon /> },
    ],
  },
];

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const router   = useRouter();
  const { theme, toggle } = useTheme();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div style={{ padding: "0 16px", height: "56px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "0.5px solid var(--border)", flexShrink: 0 }}>
        <div style={{ width: "32px", height: "32px", background: "var(--orange-mid)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 10L5 6L8 8L12 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="3" r="1.5" fill="#fff" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Commodity</div>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-bright)", letterSpacing: "0.04em" }}>CHAIN</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV.map((group) => (
          <div key={group.group} style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.1em", padding: "0 10px 6px", textTransform: "uppercase" }}>
              {group.group}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 10px", borderRadius: "9px", border: "none",
                    background: active ? "var(--orange-glow)" : "transparent",
                    cursor: "pointer", transition: "all 0.15s",
                    marginBottom: "1px", fontFamily: "var(--font-ui)",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: active ? "var(--orange-mid)" : "var(--bg-elevated)", transition: "background 0.15s" }}>
                    <span style={{ color: active ? "#fff" : "var(--text-2)" }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "var(--orange-bright)" : "var(--text-2)", transition: "color 0.15s", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                  {active && (
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--orange-mid)", marginLeft: "auto" }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 8px", borderTop: "0.5px solid var(--border)", flexShrink: 0 }}>
        <button onClick={toggle}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "9px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              {theme === "dark"
                ? <path d="M7.5 1v1M7.5 13v1M1 7.5H2M13 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M3.2 11.8l.7-.7M11.1 3.9l.7-.7M7.5 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="var(--text-2)" strokeWidth="1.3" strokeLinecap="round" />
                : <path d="M13 8.5A5.5 5.5 0 016.5 2a6 6 0 100 11 5.5 5.5 0 006.5-4.5z" stroke="var(--text-2)" strokeWidth="1.3" strokeLinecap="round" />}
            </svg>
          </div>
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}

/* ---- Icon components ---- */
function DashIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" fill="currentColor" opacity=".8"/><rect x="8" y="1" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5"/><rect x="8" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity=".8"/></svg>; }
function ExplorerIcon(){ return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L5 6L8 8L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="3" r="1.5" fill="currentColor"/></svg>; }
function MapIcon()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.4" fill="none"/><circle cx="7" cy="5" r="1.2" fill="currentColor"/></svg>; }
function CorrIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="3" height="3" rx="1" fill="currentColor"/><rect x="5.5" y="1" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/><rect x="10" y="1" width="3" height="3" rx="1" fill="currentColor" opacity=".3"/><rect x="1" y="5.5" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/><rect x="5.5" y="5.5" width="3" height="3" rx="1" fill="currentColor"/><rect x="10" y="5.5" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/><rect x="1" y="10" width="3" height="3" rx="1" fill="currentColor" opacity=".3"/><rect x="5.5" y="10" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/><rect x="10" y="10" width="3" height="3" rx="1" fill="currentColor"/></svg>; }
function ConvIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M9 2l3 2-3 2M12 10H2M5 8l-3 2 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function WatchIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.4"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>; }
function AlertIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><line x1="7" y1="5" x2="7" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="currentColor"/></svg>; }
function ExportIcon()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v7M4 5l3-4 3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v2h10v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function NewsIcon()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function LearnIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L1 5l6 3 6-3-6-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M4 6.5v3c1 1 5 1 6 0V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function AIIcon()      { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function SimIcon()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="1.4"/><circle cx="5" cy="7" r="1.5" fill="currentColor"/></svg>; }
function IndiaIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4 1.5 2 4 2 7s2 5.5 5 5.5 5-2.5 5-5.5S10 1.5 7 1.5z" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
