# CommodityChain

> Real-time commodity intelligence platform — live prices, AI analysis, India macro layer, news feed, alerts, and interactive tools.

![Dashboard Preview](./docs/dashboard.png)

**Frontend:** [commoditychain.vercel.app](https://commoditychain.vercel.app) &nbsp;·&nbsp; **Backend API:** [commoditychain.onrender.com/docs](https://commoditychain.onrender.com/docs)

---


## Features

| Module | Description |
|---|---|
| Dashboard | Live price cards, bar charts, top movers, market sentiment |
| Explorer | Full price history chart (1W/1M/3M/1Y), OHLC table, watchlist |
| Global Map | D3 world map — producer/consumer profiles for 20 countries |
| Correlation | 8×8 Pearson correlation heatmap (30-day rolling) |
| Converter | Currency + commodity unit + value converter with live FX rates |
| Watchlist | Hypothetical portfolio with live unrealised PnL |
| Alerts | Browser push notification price alerts (localStorage) |
| Export | CSV / JSON price history download |
| News | Commodity-filtered news feed with AI sentiment labels |
| Learn | Explainer articles — oil, gold, futures, copper, India context |
| AI Analyst | Groq Llama 3.3 70B chat with live price context + 3 persona modes |
| Shock Simulator | India macro impact model — drag crude price, see petrol/inflation/INR |
| India Layer | City-wise petrol/diesel prices + tax breakdown + macro indicators |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript |
| Styling | Custom CSS variable design system (dark + light) |
| Backend | FastAPI + WebSockets |
| AI | Groq Llama 3.3 70B (free tier) |
| Price data | Twelve Data API (real-time) |
| Metals fallback | metals.live |
| FX rates | open.er-api.com |
| News | NewsAPI + curated fallback |
| Frontend host | Vercel |
| Backend host | Render |

---

## Local Setup

```bash
# Terminal 1 — Backend
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` · API docs at `http://localhost:8000/docs`

---

## Environment Variables

**backend/.env**
```
ALLOWED_ORIGINS=http://localhost:3000
GROQ_API_KEY=           # console.groq.com — free
TWELVE_DATA_KEY=        # twelvedata.com — free tier
NEWS_API_KEY=           # newsapi.org — optional
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/prices` | All commodity prices |
| GET | `/api/prices/:id` | Single commodity |
| GET | `/api/news` | News feed |
| GET | `/api/rates` | Live FX rates |
| POST | `/api/analyst` | AI analysis (Groq) |
| POST | `/api/simulate` | India macro shock model |
| GET | `/api/export/:id` | CSV/JSON download |
| GET | `/api/india/prices` | City-wise petrol/diesel |
| GET | `/api/correlation` | Pearson matrix |
| WS | `/ws/prices` | Live price stream |

---

## Project Structure

```
commoditychain/
  backend/
    main.py                    # FastAPI app, 9 routers
    requirements.txt
    services/
      commodity_service.py     # Twelve Data + GBM fallback
    routers/
      prices.py / websocket.py / news.py / fx.py
      analyst.py / simulator.py / export.py
      india.py / correlation.py
  frontend/src/
    app/                       # 13 pages (Next.js App Router)
    components/
      Sidebar.tsx              # Grouped nav with icons
      Topbar.tsx               # Search + live status
      PriceCard.tsx / Ticker.tsx / StatsBar.tsx
    hooks/
      usePrices.ts / useTheme.ts / useWatchlist.ts
    lib/
      api.ts / constants.ts / utils.ts
```

---

## Build Phases

| Phase | Features |
|---|---|
| 1 | Dashboard, live prices, WebSocket, dark mode |
| 2 | Explorer, News, Converter, Watchlist |
| 3 | AI Analyst, Shock Simulator, Alerts, Learn |
| 4 | Global Map, Correlation Matrix, Export, India Layer |

---

*Built by Ayush Raj — BSc CSDA @ IIT Patna 2024–2028*  
*Stack: Next.js 14 · FastAPI · Groq · Twelve Data · Vercel · Render*
