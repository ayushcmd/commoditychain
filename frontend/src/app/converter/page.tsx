"use client";

import { useState, useEffect } from "react";
import { FxRates, UNIT_CONVERSIONS } from "@/types";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { formatPrice } from "@/lib/utils";

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY", "SGD", "AED"];
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar", INR: "Indian Rupee", EUR: "Euro", GBP: "British Pound",
  JPY: "Japanese Yen", AUD: "Australian Dollar", CAD: "Canadian Dollar",
  CNY: "Chinese Yuan", SGD: "Singapore Dollar", AED: "UAE Dirham",
};

export default function ConverterPage() {
  const { commodities, isConnected, lastUpdated } = usePrices();
  const [rates, setRates] = useState<FxRates>({});
  const [loadingRates, setLoadingRates] = useState(true);

  // Currency converter state
  const [ccFrom, setCcFrom] = useState("USD");
  const [ccTo,   setCcTo]   = useState("INR");
  const [ccAmt,  setCcAmt]  = useState("1");

  // Unit converter state
  const [ucCommodity, setUcCommodity] = useState("gold");
  const [ucFromUnit,  setUcFromUnit]  = useState(0);
  const [ucToUnit,    setUcToUnit]    = useState(1);
  const [ucAmt,       setUcAmt]       = useState("1");

  // Commodity value converter
  const [vcCommodity, setVcCommodity] = useState("gold");
  const [vcAmt,       setVcAmt]       = useState("1");
  const [vcCurrency,  setVcCurrency]  = useState("INR");

  useEffect(() => {
    api.getRates().then(r => { setRates(r); setLoadingRates(false); }).catch(() => setLoadingRates(false));
  }, []);

  // Currency conversion
  const ccResult = () => {
    if (!rates[ccFrom] || !rates[ccTo]) return null;
    const usd = parseFloat(ccAmt) / rates[ccFrom];
    return usd * rates[ccTo];
  };

  // Unit conversion
  const commodity = commodities.find(c => c.id === ucCommodity);
  const ucCategory = commodity?.category === "energy" ? "energy" : "metals";
  const ucUnits = UNIT_CONVERSIONS[ucCategory] || UNIT_CONVERSIONS.metals;
  const ucResult = () => {
    const amt = parseFloat(ucAmt);
    if (isNaN(amt)) return null;
    const fromConv = ucUnits[ucFromUnit];
    const toConv   = ucUnits[ucToUnit];
    if (!fromConv || !toConv) return null;
    const inBase = amt * fromConv.fromBase;
    return inBase / toConv.fromBase;
  };

  // Commodity value in currency
  const vcCom = commodities.find(c => c.id === vcCommodity);
  const vcResult = () => {
    if (!vcCom || !rates[vcCurrency]) return null;
    const usdValue = parseFloat(vcAmt) * vcCom.price;
    return usdValue * rates[vcCurrency];
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)",
    borderRadius: "8px", padding: "10px 14px", color: "var(--text-primary)",
    fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 600,
    width: "100%", outline: "none",
  };
  const selectStyle: React.CSSProperties = {
    background: "var(--bg-elevated)", border: "0.5px solid var(--border-strong)",
    borderRadius: "8px", padding: "10px 14px", color: "var(--text-primary)",
    fontFamily: "var(--font-ui)", fontSize: "13px", width: "100%", cursor: "pointer",
  };
  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)", border: "0.5px solid var(--border)",
    borderRadius: "14px", padding: "1.5rem",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "6px",
  };
  const resultStyle: React.CSSProperties = {
    background: "var(--surface-orange)", border: "0.5px solid var(--orange-border)",
    borderRadius: "10px", padding: "1rem 1.25rem", marginTop: "1rem",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Converter" />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Converter</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Currency, unit, and commodity value conversion</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Currency converter */}
          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Currency Converter</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <div style={labelStyle}>FROM</div>
                <select value={ccFrom} onChange={e => setCcFrom(e.target.value)} style={selectStyle}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>TO</div>
                <select value={ccTo} onChange={e => setCcTo(e.target.value)} style={selectStyle}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={labelStyle}>AMOUNT</div>
              <input type="number" value={ccAmt} onChange={e => setCcAmt(e.target.value)} style={inputStyle} />
            </div>
            <div style={resultStyle}>
              <div style={{ fontSize: "11px", color: "var(--orange-mid)", marginBottom: "4px" }}>RESULT</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)" }}>
                {loadingRates ? "Loading rates..." : ccResult() !== null ? `${ccTo} ${ccResult()!.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : "—"}
              </div>
              {rates[ccFrom] && rates[ccTo] && (
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  1 {ccFrom} = {(rates[ccTo] / rates[ccFrom]).toFixed(4)} {ccTo}
                </div>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "8px" }}>Rates via open.er-api.com · Updated hourly</div>
          </div>

          {/* Unit converter */}
          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Unit Converter</div>
            <div style={{ marginBottom: "10px" }}>
              <div style={labelStyle}>COMMODITY</div>
              <select value={ucCommodity} onChange={e => { setUcCommodity(e.target.value); setUcFromUnit(0); setUcToUnit(1); }} style={selectStyle}>
                {commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <div style={labelStyle}>FROM</div>
                <select value={ucFromUnit} onChange={e => setUcFromUnit(Number(e.target.value))} style={selectStyle}>
                  {ucUnits.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>TO</div>
                <select value={ucToUnit} onChange={e => setUcToUnit(Number(e.target.value))} style={selectStyle}>
                  {ucUnits.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={labelStyle}>AMOUNT</div>
              <input type="number" value={ucAmt} onChange={e => setUcAmt(e.target.value)} style={inputStyle} />
            </div>
            <div style={resultStyle}>
              <div style={{ fontSize: "11px", color: "var(--orange-mid)", marginBottom: "4px" }}>RESULT</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)" }}>
                {ucResult() !== null ? `${ucResult()!.toFixed(6)} ${ucUnits[ucToUnit]?.label}` : "—"}
              </div>
            </div>
          </div>

          {/* Commodity value converter — full width */}
          <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Commodity Value</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", alignItems: "end" }}>
              <div>
                <div style={labelStyle}>COMMODITY</div>
                <select value={vcCommodity} onChange={e => setVcCommodity(e.target.value)} style={selectStyle}>
                  {commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>QUANTITY</div>
                <input type="number" value={vcAmt} onChange={e => setVcAmt(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <div style={labelStyle}>IN CURRENCY</div>
                <select value={vcCurrency} onChange={e => setVcCurrency(e.target.value)} style={selectStyle}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ ...resultStyle, margin: 0 }}>
                <div style={{ fontSize: "10px", color: "var(--orange-mid)", marginBottom: "3px" }}>VALUE</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {vcResult() !== null
                    ? `${vcCurrency} ${vcResult()!.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                    : "—"}
                </div>
                {vcCom && <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "3px" }}>@ {formatPrice(vcCom.price)} {vcCom.unit}</div>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
