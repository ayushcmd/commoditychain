"use client";

import { useTheme } from "@/hooks/useTheme";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Markets",
    items: [
      { label: "Dashboard",   href: "/" },
      { label: "Explorer",    href: "/explorer" },
      { label: "Map",         href: "/map" },
      { label: "Correlation", href: "/correlation" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Converter",  href: "/converter" },
      { label: "Watchlist",  href: "/watchlist" },
      { label: "Alerts",     href: "/alerts" },
      { label: "Export",     href: "/export" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "News",       href: "/news" },
      { label: "Learn",      href: "/learn" },
      { label: "Analyst",    href: "/analyst" },
      { label: "Simulator",  href: "/simulator" },
      { label: "India",      href: "/india" },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

interface NavbarProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  activePage?: string;
}

export function Navbar({ isConnected, lastUpdated, activePage }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "0.5px solid var(--border)", background: "var(--bg-base)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem", height: "52px", display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Logo */}
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 }}>
          <div style={{ width: "28px", height: "28px", background: "var(--orange-mid)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L5 6L8 8L12 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="3" r="1.5" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>CommodityChain</span>
        </div>

        {/* Nav groups */}
        <nav style={{ display: "flex", gap: "2px", flex: 1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpen(group.label)}
              onMouseLeave={() => setOpen(null)}>
              <button style={{
                background: group.items.some(i => isActive(i.href)) ? "var(--surface-orange)" : "transparent",
                border: group.items.some(i => isActive(i.href)) ? "0.5px solid var(--orange-border)" : "0.5px solid transparent",
                borderRadius: "7px", padding: "5px 12px", fontSize: "12px", fontWeight: 500,
                color: group.items.some(i => isActive(i.href)) ? "var(--orange-bright)" : "var(--text-secondary)",
                cursor: "pointer", fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: "4px",
              }}>
                {group.label}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M2 3.5L4.5 6L7 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {open === group.label && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "4px", minWidth: "140px", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                  {group.items.map(item => (
                    <button key={item.href}
                      onClick={() => { router.push(item.href); setOpen(null); }}
                      style={{ display: "block", width: "100%", background: isActive(item.href) ? "var(--surface-orange)" : "transparent", border: "none", borderRadius: "7px", padding: "7px 12px", fontSize: "12px", fontWeight: 500, color: isActive(item.href) ? "var(--orange-bright)" : "var(--text-secondary)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-ui)", transition: "all 0.1s" }}
                      onMouseEnter={e => { if (!isActive(item.href)) { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
                      onMouseLeave={e => { if (!isActive(item.href)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right — live status + theme */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ position: "relative", width: "7px", height: "7px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: isConnected ? "var(--up)" : "var(--text-tertiary)" }} />
              {isConnected && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--up)", animation: "pulse-ring 1.8s ease-out infinite" }} />}
            </div>
            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {isConnected ? "Live" : "Polling"}{lastUpdated ? " " + lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
            </span>
          </div>
          <button onClick={toggle} style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
              {theme === "dark"
                ? <path d="M7.5 1v1M7.5 13v1M1 7.5H2M13 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M3.2 11.8l.7-.7M11.1 3.9l.7-.7M7.5 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="var(--text-secondary)" strokeWidth="1.3" strokeLinecap="round" />
                : <path d="M13 8.5A5.5 5.5 0 016.5 2a6 6 0 100 11 5.5 5.5 0 006.5-4.5z" stroke="var(--text-secondary)" strokeWidth="1.3" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
