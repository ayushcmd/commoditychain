"use client";

interface TopbarProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  actions?: React.ReactNode;
}

export function Topbar({ isConnected, lastUpdated, actions }: TopbarProps) {
  return (
    <div className="app-topbar">
      {/* Search */}
      <div style={{ flex: 1, maxWidth: "320px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "0.5px solid var(--border)", borderRadius: "9px", padding: "7px 12px" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="var(--text-3)" strokeWidth="1.3"/>
            <path d="M8.5 8.5L11 11" stroke="var(--text-3)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Search markets...</span>
          <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-4)", background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: "4px", border: "0.5px solid var(--border)" }}>Ctrl K</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live status */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "var(--bg-elevated)", borderRadius: "20px", border: "0.5px solid var(--border)" }}>
        <div style={{ position: "relative", width: "7px", height: "7px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: isConnected ? "var(--up)" : "var(--text-3)" }} />
          {isConnected && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--up)", animation: "pulse-dot 1.8s ease-out infinite" }} />
          )}
        </div>
        <span style={{ fontSize: "11px", fontWeight: 500, color: isConnected ? "var(--up)" : "var(--text-3)" }}>
          {isConnected ? "Live" : "Polling"}
        </span>
        {lastUpdated && (
          <span style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
            {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>

      {actions}
    </div>
  );
}