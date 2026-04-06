"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { usePrices } from "@/hooks/usePrices";

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  sections: { heading: string; body: string }[];
  sources: { label: string; url: string }[];
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: "why-oil-prices-fluctuate",
    title: "Why crude oil prices fluctuate so much",
    category: "Energy",
    readTime: 6,
    difficulty: "Beginner",
    summary: "Oil prices are determined by the balance of global supply and demand, OPEC decisions, geopolitical events, and speculative trading. A change in any of these can swing prices by 10% in a day.",
    tags: ["crude oil", "OPEC", "supply & demand", "geopolitics"],
    sections: [
      {
        heading: "Supply side — OPEC and production",
        body: "The Organization of the Petroleum Exporting Countries (OPEC), together with Russia and other allies (OPEC+), controls roughly 40% of global oil production. When OPEC cuts production quotas, supply falls and prices rise. When it opens the taps, prices fall. US shale production acts as a counterbalance — American shale producers can quickly ramp up or cut output, which puts a ceiling on how high oil prices can go."
      },
      {
        heading: "Demand side — China, India, and economic cycles",
        body: "China and India together consume roughly 25% of global oil. Weak manufacturing data from China instantly signals lower fuel demand and pushes prices down. Recessions globally reduce demand. Conversely, a cold winter in Europe or a hot summer in the US drives up heating and cooling fuel demand. Aviation and shipping are also large consumers — post-pandemic travel recovery was a major driver of the 2022 oil price surge."
      },
      {
        heading: "Geopolitics and supply disruptions",
        body: "Wars, sanctions, and infrastructure attacks instantly affect supply. The Russia-Ukraine war removed significant Russian oil from Western markets and sent Brent above $130 in 2022. Attacks on Saudi oil facilities, Strait of Hormuz tensions (20% of global oil passes through this 33km chokepoint), and sanctions on Iran or Venezuela all restrict supply and spike prices."
      },
      {
        heading: "The USD relationship",
        body: "Oil is priced in US dollars globally. When the dollar strengthens, oil becomes more expensive for buyers holding other currencies — demand falls and prices drop. When the dollar weakens, oil becomes relatively cheaper, boosting demand and prices. This is why US Federal Reserve interest rate decisions often move oil prices within hours."
      },
      {
        heading: "Impact on India",
        body: "India imports 85% of its crude oil needs. Every $10/barrel rise in crude adds roughly Rs 1.50 to a litre of petrol, widens the trade deficit by $15 billion annually, puts pressure on the rupee, and adds 0.2% to CPI inflation. The government partially absorbs shocks by adjusting excise duty, which is why pump prices in India do not move 1:1 with global crude."
      }
    ],
    sources: [
      { label: "EIA — Crude Oil Explained",     url: "https://www.eia.gov/energyexplained/oil-and-petroleum-products/" },
      { label: "OPEC official website",          url: "https://www.opec.org" },
      { label: "RBI Annual Report — Oil Impact", url: "https://www.rbi.org.in" },
    ]
  },
  {
    id: "gold-as-safe-haven",
    title: "Gold: why it rises when everything else falls",
    category: "Metals",
    readTime: 5,
    difficulty: "Beginner",
    summary: "Gold has been a store of value for 5,000 years. In modern markets, it rises when investors fear inflation, currency devaluation, or financial collapse — and falls when confidence returns.",
    tags: ["gold", "safe haven", "inflation", "central banks"],
    sections: [
      {
        heading: "Store of value vs currency",
        body: "Unlike fiat currencies (rupee, dollar, euro), gold cannot be printed. There is a finite supply — all gold ever mined would fill about 3.5 Olympic swimming pools. When central banks print money (quantitative easing), each unit of currency buys less. Gold, being scarce, holds its purchasing power. This is why gold surged after the 2008 financial crisis when the Fed started printing trillions of dollars."
      },
      {
        heading: "Interest rates — the key driver",
        body: "Gold pays no interest or dividend. When real interest rates (nominal rate minus inflation) are high, investors prefer bonds because they get paid to hold them. Gold loses its appeal. When real rates are negative — meaning inflation exceeds the interest rate — gold becomes more attractive than cash. The 2020-2022 gold rally was driven by near-zero interest rates and high inflation making real rates deeply negative."
      },
      {
        heading: "Central bank buying",
        body: "Central banks hold gold as a reserve asset to diversify away from the US dollar. China, India, Poland, and Turkey have been major buyers in recent years. The Reserve Bank of India significantly increased its gold reserves between 2022-2024. Large central bank purchases create sustained demand and put a floor under prices."
      },
      {
        heading: "India — cultural and investment demand",
        body: "India is the world's second-largest gold consumer. About 700-800 tonnes are imported annually. Gold jewellery demand peaks during Diwali, Akshaya Tritiya, and the October-March wedding season. Domestic gold prices in INR are influenced by both international gold prices and the INR/USD exchange rate — a weaker rupee means higher domestic gold prices even if international prices are flat."
      }
    ],
    sources: [
      { label: "World Gold Council",         url: "https://www.gold.org/goldhub/research" },
      { label: "RBI Gold Reserves Data",     url: "https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx" },
      { label: "IMF — Gold in the IMF",      url: "https://www.imf.org/en/About/Factsheets/Sheets/2023/gold" },
    ]
  },
  {
    id: "futures-spot-contango",
    title: "Spot price, futures, contango, and backwardation explained",
    category: "Concepts",
    readTime: 7,
    difficulty: "Intermediate",
    summary: "The price you see on CommodityChain is the spot price — what the commodity costs right now. Futures prices tell you what the market expects it to cost in the future. The difference between them reveals a lot about market sentiment.",
    tags: ["futures", "spot price", "contango", "backwardation", "derivatives"],
    sections: [
      {
        heading: "Spot price vs futures price",
        body: "The spot price is the current market price for immediate delivery of a commodity. The futures price is a contract price for delivery at a specified future date (e.g., 3 months from now). Futures are traded on exchanges like NYMEX (New York) and MCX (India). They were originally invented so that airlines could lock in fuel prices for the year ahead, or farmers could guarantee a price for their harvest before it was grown."
      },
      {
        heading: "Contango — when futures are more expensive than spot",
        body: "Contango is the normal state of commodity markets. Futures cost more than spot because storing a commodity (in warehouses, tanks) costs money, you need to insure it, and there is a financing cost. If crude oil spot is $80 and the 6-month future is $83, the $3 difference reflects storage and financing costs. Contango signals that the market expects prices to stay stable or rise gradually."
      },
      {
        heading: "Backwardation — when futures are cheaper than spot",
        body: "Backwardation occurs when the spot price is higher than futures prices. This signals an immediate shortage — buyers need the commodity NOW and are willing to pay a premium. It often occurs during supply disruptions, cold snaps for natural gas, or when a major producer unexpectedly cuts output. Backwardation is considered a bullish signal — the market is tight right now."
      },
      {
        heading: "Why this matters for India",
        body: "Indian oil companies use futures markets to hedge their import costs. Indian gold importers use COMEX futures to price their purchases. When global commodity futures go into steep backwardation, it often signals imminent price spikes — a useful early warning indicator. MCX (Multi Commodity Exchange) is India's primary commodity futures exchange where you can track these curves."
      }
    ],
    sources: [
      { label: "CME Group — Futures Fundamentals", url: "https://www.cmegroup.com/education/futures-and-options.html" },
      { label: "MCX India",                        url: "https://www.mcxindia.com" },
      { label: "Investopedia — Contango",           url: "https://www.investopedia.com/terms/c/contango.asp" },
    ]
  },
  {
    id: "copper-economic-indicator",
    title: "Why copper is called Dr. Copper — the economic indicator",
    category: "Metals",
    readTime: 4,
    difficulty: "Intermediate",
    summary: "Copper is used in almost everything: wiring, plumbing, electronics, EVs, solar panels. Its price is one of the best leading indicators of global economic health — and its demand is set to explode with the energy transition.",
    tags: ["copper", "macroeconomics", "EVs", "energy transition"],
    sections: [
      {
        heading: "Why copper is an economic barometer",
        body: "Copper is essential to construction, manufacturing, and electronics. When the economy is expanding, factories increase production, construction booms, and consumer electronics sales rise — all driving copper demand and pushing its price up. When the economy contracts, copper demand falls and prices drop. Traders coined the term 'Dr. Copper' because copper prices have a PhD in economics — they often predict recessions and recoveries before official data confirms them."
      },
      {
        heading: "The energy transition demand surge",
        body: "An electric vehicle requires 2.5 to 4 times more copper than a petrol car. A solar farm requires 4-5 tonnes of copper per MW. A wind turbine requires 3-4 tonnes. As the global economy transitions to clean energy, copper demand is expected to double by 2035 according to Goldman Sachs. Supply, however, is constrained — major copper mines in Chile and Peru are facing falling ore grades and community opposition, creating a potential structural deficit."
      },
      {
        heading: "China dominates",
        body: "China consumes roughly 55% of global copper production. This is why Chinese economic data — PMI, industrial production, property sales — immediately move copper prices. The 2021 copper surge to $10,000/tonne was driven by post-pandemic Chinese stimulus. The 2022-23 dip was caused by China's property sector crisis reducing construction activity."
      }
    ],
    sources: [
      { label: "Copper Alliance",         url: "https://copperalliance.org" },
      { label: "USGS Copper Statistics",  url: "https://www.usgs.gov/centers/national-minerals-information-center/copper-statistics-and-information" },
      { label: "Goldman Sachs Copper Report", url: "https://www.goldmansachs.com" },
    ]
  },
];

const DIFFICULTY_COLORS = { Beginner: "#22C55E", Intermediate: "#F59E0B", Advanced: "#EF4444" };

export default function LearnPage() {
  const { isConnected, lastUpdated } = usePrices();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(ARTICLES.map(a => a.category)))];
  const filtered = filter === "All" ? ARTICLES : ARTICLES.filter(a => a.category === filter);
  const article = ARTICLES.find(a => a.id === selected);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar isConnected={isConnected} lastUpdated={lastUpdated} activePage="Learn" />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "1fr", gap: "20px" }}>

        {/* Article list */}
        <div>
          <div style={{ marginBottom: "1.25rem" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>Learn</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Why commodity prices move — fundamentals, concepts, and India context</p>
          </div>

          <div style={{ display: "flex", gap: "6px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ background: filter === c ? "var(--orange-mid)" : "var(--bg-card)", border: filter === c ? "none" : "0.5px solid var(--border)", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 500, color: filter === c ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map(a => (
              <div key={a.id} onClick={() => setSelected(a.id === selected ? null : a.id)}
                style={{ background: selected === a.id ? "var(--surface-orange)" : "var(--bg-card)", border: selected === a.id ? "0.5px solid var(--orange-border)" : "0.5px solid var(--border)", borderRadius: "12px", padding: "1rem 1.1rem", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-mid)" }}>{a.category}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "20px", background: `${DIFFICULTY_COLORS[a.difficulty]}18`, color: DIFFICULTY_COLORS[a.difficulty] }}>{a.difficulty}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{a.readTime} min</span>
                  </div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: selected === a.id ? "var(--orange-bright)" : "var(--text-primary)", lineHeight: 1.45 }}>{a.title}</div>
                {!selected && <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>{a.summary.substring(0, 100)}...</div>}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                  {a.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "20px", background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Article reader */}
        {article && (
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "2rem", overflowY: "auto", maxHeight: "80vh", position: "sticky", top: "70px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-mid)" }}>{article.category}</span>
                  <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "20px", background: `${DIFFICULTY_COLORS[article.difficulty]}18`, color: DIFFICULTY_COLORS[article.difficulty] }}>{article.difficulty}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{article.readTime} min read</span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.02em" }}>{article.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)", borderRadius: "7px", padding: "4px 10px", fontSize: "11px", color: "var(--text-tertiary)", cursor: "pointer", flexShrink: 0, marginLeft: "12px", fontFamily: "var(--font-ui)" }}>Close</button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem", borderLeft: "2px solid var(--orange-mid)", paddingLeft: "14px", fontStyle: "italic" }}>{article.summary}</p>

            {article.sections.map((s, i) => (
              <div key={i} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.01em" }}>{s.heading}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}

            {/* Sources */}
            <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.07em", marginBottom: "8px" }}>SOURCES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {article.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "var(--orange-mid)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M4 2H2a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V6M6 1h3m0 0v3M9 1L5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
