"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { formatPrice } from "@/lib/utils";

interface Alert {
  id: string;
  commodityId: string;
  commodityName: string;
  type: "above" | "below";
  targetPrice: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

const STORAGE_KEY = "cc-alerts";

function loadAlerts(): Alert[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveAlerts(a: Alert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
}

export default function AlertsPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selId, setSelId] = useState("");
  const [type, setType] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    setAlerts(loadAlerts());
    if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!commodities.length || !alerts.length) return;
    const updated = [...alerts];
    let changed = false;

    for (const alert of updated) {
      if (alert.triggered) continue;
      const com = commodities.find(c => c.id === alert.commodityId);
      if (!com) continue;
      const prev = prevPrices.current[com.id];
      const now  = com.price;
      const hit  = alert.type === "above" ? now >= alert.targetPrice : now <= alert.targetPrice;

      if (hit && prev !== undefined) {
        alert.triggered = true;
        alert.triggeredAt = new Date().toISOString();
        changed = true;

        if (notifPermission === "granted") {
          new Notification(`CommodityChain Alert`, {
            body: `${alert.commodityName} is ${alert.type} ${formatPrice(alert.targetPrice)} — now at ${formatPrice(now)}`,
          });
        }
      }
      prevPrices.current[com.id] = now;
    }

    if (changed) {
      saveAlerts(updated);
      setAlerts([...updated]);
    } else {
      commodities.forEach(c => { prevPrices.current[c.id] = c.price; });
    }
  }, [commodities]);

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  const addAlert = () => {
    const com = commodities.find(c => c.id === selId);
    const t   = parseFloat(target);
    if (!com || isNaN(t) || t <= 0) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      commodityId: selId,
      commodityName: com.name,
      type,
      targetPrice: t,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    const next = [newAlert, ...alerts];
    saveAlerts(next);
    setAlerts(next);
    setTarget("");
  };

  const removeAlert = (id: string) => {
    const next = alerts.filter(a => a.id !== id);
    saveAlerts(next);
    setAlerts(next);
  };

  const clearTriggered = () => {
    const next = alerts.filter(a => !a.triggered);
    saveAlerts(next);
    setAlerts(next);
  };

  const selectedCom = commodities.find(c => c.id === selId);
  const activeAlerts    = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)",
    borderRadius: "8px", padding: "9px 12px", color: "var(--text-primary)",
    fontFamily: "var(--font-mono)", fontSize: "13px", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Alerts" />

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Price Alerts</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Get browser notifications when a commodity crosses your target price. Stored locally — no login needed.</p>
        </div>

        {/* Notification permission banner */}
        {notifPermission !== "granted" && (
          <div style={{ background: "var(--surface-orange)", border: "0.5px solid var(--orange-border)", borderRadius: "10px", padding: "12px 16px", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--orange-bright)" }}>Enable browser notifications to receive real-time alerts</div>
            <button onClick={requestNotif} style={{ background: "var(--orange-mid)", border: "none", borderRadius: "7px", padding: "6px 14px", fontSize: "12px", fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Enable</button>
          </div>
        )}

        {/* Create alert form */}
        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "1.1rem" }}>Create New Alert</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: "10px", alignItems: "end" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "5px" }}>COMMODITY</div>
              <select value={selId} onChange={e => { setSelId(e.target.value); setTarget(""); }}
                style={{ ...inputStyle, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
                <option value="">Select commodity</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {formatPrice(c.price)}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "5px" }}>CONDITION</div>
              <div style={{ display: "flex", background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden" }}>
                {(["above", "below"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} style={{ flex: 1, background: type === t ? "var(--orange-mid)" : "transparent", border: "none", padding: "9px 0", fontSize: "12px", fontWeight: 500, color: type === t ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all 0.15s" }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "5px" }}>
                TARGET PRICE {selectedCom && `(current: ${formatPrice(selectedCom.price)})`}
              </div>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)}
                placeholder={selectedCom ? String(selectedCom.price.toFixed(2)) : "0.00"}
                style={inputStyle} />
            </div>
            <button onClick={addAlert} disabled={!selId || !target}
              style={{ background: selId && target ? "var(--orange-mid)" : "var(--bg-elevated)", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: 500, color: selId && target ? "#fff" : "var(--text-tertiary)", cursor: selId && target ? "pointer" : "not-allowed", fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
              Set Alert
            </button>
          </div>
        </div>

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "8px" }}>ACTIVE ALERTS ({activeAlerts.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {activeAlerts.map(a => {
                const com = commodities.find(c => c.id === a.commodityId);
                const dist = com ? Math.abs(com.price - a.targetPrice) : null;
                const distPct = com ? (dist! / com.price) * 100 : null;
                return (
                  <div key={a.id} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{a.commodityName}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 6px" }}>{a.type}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--orange-mid)" }}>{formatPrice(a.targetPrice)}</span>
                    </div>
                    {com && distPct !== null && (
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        {distPct.toFixed(1)}% away · now {formatPrice(com.price)}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--up)", animation: "pulse-ring 2s ease-out infinite" }} />
                      <button onClick={() => removeAlert(a.id)} style={{ background: "transparent", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Triggered alerts */}
        {triggeredAlerts.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.07em" }}>TRIGGERED ({triggeredAlerts.length})</div>
              <button onClick={clearTriggered} style={{ background: "transparent", border: "none", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Clear all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {triggeredAlerts.map(a => (
                <div key={a.id} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "16px", opacity: 0.6 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{a.commodityName}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 6px" }}>{a.type}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--up)" }}>{formatPrice(a.targetPrice)}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", marginLeft: "10px" }}>Triggered {a.triggeredAt ? new Date(a.triggeredAt).toLocaleString("en-IN") : ""}</span>
                  </div>
                  <button onClick={() => removeAlert(a.id)} style={{ background: "transparent", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.length === 0 && (
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "3rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>
            No alerts set. Create one above to get notified when a price crosses your target.
          </div>
        )}
      </main>
    </div>
  );
}
