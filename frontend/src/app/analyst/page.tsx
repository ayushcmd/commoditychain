"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";
import { api } from "@/lib/api";

type Persona = "normal" | "trader" | "student";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona?: Persona;
  timestamp: Date;
}

const PERSONA_CONFIG: Record<Persona, { label: string; desc: string; color: string }> = {
  normal:  { label: "Normal",  desc: "Simple explanations",    color: "#3B82F6" },
  trader:  { label: "Trader",  desc: "Technical & data-driven", color: "#F59E0B" },
  student: { label: "Student", desc: "Educational deep-dive",   color: "#8B5CF6" },
};

const SUGGESTED = [
  "Why is gold price rising this week?",
  "What drives crude oil prices?",
  "How does natural gas affect inflation in India?",
  "Should I be concerned about silver price volatility?",
  "What is the relationship between crude oil and the INR?",
  "Explain contango and backwardation simply",
];

export default function AnalystPage() {
  const { isConnected, lastUpdated } = usePrices();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<Persona>("normal");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/analyst`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, persona }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        persona,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Could not reach the AI service. Make sure the backend is running.",
        persona,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const pc = PERSONA_CONFIG[persona];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Analyst" />

      <main style={{ maxWidth: "820px", margin: "0 auto", width: "100%", padding: "2rem 1.5rem 0", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>AI Price Analyst</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Ask anything about commodity markets — powered by Groq Llama 3.3 70B with live price context</p>
        </div>

        {/* Persona selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
          {(Object.keys(PERSONA_CONFIG) as Persona[]).map(p => {
            const cfg = PERSONA_CONFIG[p];
            const active = persona === p;
            return (
              <button key={p} onClick={() => setPersona(p)}
                style={{ flex: 1, background: active ? `${cfg.color}15` : "var(--bg-card)", border: active ? `1.5px solid ${cfg.color}60` : "0.5px solid var(--border)", borderRadius: "10px", padding: "10px 12px", cursor: "pointer", transition: "all 0.15s", textAlign: "left", fontFamily: "var(--font-ui)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: active ? cfg.color : "var(--text-primary)", marginBottom: "2px" }}>{cfg.label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{cfg.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "1.25rem", marginBottom: "12px", minHeight: "360px", maxHeight: "460px" }}>

          {messages.length === 0 && (
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "1rem", textAlign: "center", padding: "1rem 0" }}>
                Ask anything about commodity prices, macro trends, or market movements.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {SUGGESTED.map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)", borderRadius: "9px", padding: "10px 12px", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer", textAlign: "left", lineHeight: 1.5, transition: "border-color 0.15s, color 0.15s", fontFamily: "var(--font-ui)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: "1rem", display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ width: "28px", height: "28px", background: msg.persona ? `${PERSONA_CONFIG[msg.persona].color}20` : "var(--surface-orange)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px", flexShrink: 0, marginTop: "2px" }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 10L5 6L8 8L12 3" stroke={msg.persona ? PERSONA_CONFIG[msg.persona].color : "var(--orange-mid)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="3" r="1.5" fill={msg.persona ? PERSONA_CONFIG[msg.persona].color : "var(--orange-mid)"} />
                  </svg>
                </div>
              )}
              <div style={{ maxWidth: "78%", background: msg.role === "user" ? "var(--orange-mid)" : "var(--bg-elevated)", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding: "10px 14px" }}>
                <div style={{ fontSize: "13px", color: msg.role === "user" ? "#fff" : "var(--text-primary)", lineHeight: 1.65 }}>{msg.content}</div>
                <div style={{ fontSize: "10px", color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)", marginTop: "5px", fontFamily: "var(--font-mono)" }}>
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {msg.role === "assistant" && msg.persona && ` · ${PERSONA_CONFIG[msg.persona].label} mode`}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
              <div style={{ width: "28px", height: "28px", background: "var(--surface-orange)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10L5 6L8 8L12 3" stroke="var(--orange-mid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ background: "var(--bg-elevated)", borderRadius: "4px 14px 14px 14px", padding: "10px 16px", display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--orange-mid)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "8px", paddingBottom: "2rem" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={`Ask about commodity markets... (${pc.label} mode)`}
            disabled={loading}
            style={{ flex: 1, background: "var(--bg-card)", border: "0.5px solid var(--border-strong)", borderRadius: "10px", padding: "12px 16px", color: "var(--text-primary)", fontFamily: "var(--font-ui)", fontSize: "13px", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = "var(--orange-border)"}
            onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ background: input.trim() && !loading ? "var(--orange-mid)" : "var(--bg-elevated)", border: "none", borderRadius: "10px", padding: "12px 20px", fontSize: "13px", fontWeight: 500, color: input.trim() && !loading ? "#fff" : "var(--text-tertiary)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", transition: "background 0.15s", fontFamily: "var(--font-ui)" }}>
            Ask
          </button>
        </div>
      </main>
    </div>
  );
}
