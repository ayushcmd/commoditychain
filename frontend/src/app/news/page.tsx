"use client";

import { useState, useEffect } from "react";
import { NewsArticle } from "@/types";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";

const COMMODITY_FILTERS = [
  { id: "all",         label: "All" },
  { id: "crude-wti",   label: "Crude Oil" },
  { id: "crude-brent", label: "Brent" },
  { id: "natural-gas", label: "Natural Gas" },
  { id: "gold",        label: "Gold" },
  { id: "silver",      label: "Silver" },
  { id: "copper",      label: "Copper" },
  { id: "platinum",    label: "Platinum" },
];

const SENTIMENT_COLOR = { positive: "var(--up)", negative: "var(--down)", neutral: "var(--text-tertiary)" };
const SENTIMENT_BG    = { positive: "var(--up-dim)", negative: "var(--down-dim)", neutral: "var(--bg-elevated)" };

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsPage() {
  const { isConnected, lastUpdated } = usePrices();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getNews(filter)
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="News" />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Market News</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Latest commodity headlines — sentiment tagged</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {COMMODITY_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ background: filter === f.id ? "var(--orange-mid)" : "var(--bg-card)", border: filter === f.id ? "none" : "0.5px solid var(--border)", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: 500, color: filter === f.id ? "#fff" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-ui)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", height: "180px", opacity: 0.4 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
            {articles.map(a => (
              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block", background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.1rem 1.25rem", transition: "border-color 0.15s, transform 0.15s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange-border)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>

                {/* Top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: SENTIMENT_COLOR[a.sentiment], opacity: 0.7 }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-tertiary)" }}>{a.source}</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: SENTIMENT_BG[a.sentiment], color: SENTIMENT_COLOR[a.sentiment], fontWeight: 500 }}>{a.sentiment}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{a.readTime} min</span>
                  </div>
                </div>

                {/* Title */}
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.55, marginBottom: "10px" }}>{a.title}</div>

                {/* Description */}
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.description}</div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "0.5px solid var(--border)" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{timeAgo(a.publishedAt)}</span>
                  <span style={{ fontSize: "10px", color: "var(--orange-mid)", fontWeight: 500 }}>Read article</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-tertiary)" }}>No articles found for this filter.</div>
        )}
      </main>
    </div>
  );
}
