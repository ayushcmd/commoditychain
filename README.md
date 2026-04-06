# CommodityChain

Real-time commodity intelligence platform — crude oil, gold, silver, natural gas, copper and more.

## Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 14 + TypeScript, TailwindCSS | Vercel (free) |
| Backend | FastAPI + WebSockets | Fly.io (free) |
| Data | yfinance (Yahoo Finance), FRED API | Free, no key |
| AI (Phase 3) | Groq Llama 3.3 70B | Free tier |

## Phase 1 Features

- Live price cards — price, 24h change, high/low, prev close
- Sparkline mini-charts with 30-day history
- Infinite scroll ticker strip
- Category filter: All / Energy / Metals / Agriculture
- Market stats bar: gainers, losers, top mover
- Volatility badge: Low / Medium / High / Extreme
- Dark / light mode toggle (persisted)
- WebSocket live updates with polling fallback
- Auto-reconnect on WS disconnect

## Local Setup

### Backend

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at http://localhost:8000
API docs at http://localhost:8000/docs

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

### Environment files

`backend/.env` — already created, no changes needed for local dev.

`frontend/.env.local` — already created, no changes needed for local dev.

## Project Structure

```
commoditychain/
  backend/
    main.py                         # FastAPI app, CORS, startup
    requirements.txt
    .env
    models/
      commodity.py                  # Pydantic models
    routers/
      prices.py                     # GET /api/prices, /api/prices/:id, /api/ticker
      websocket.py                  # WS /ws/prices, broadcast loop
    services/
      commodity_service.py          # yfinance fetch, cache (TTL 55s)
  frontend/
    src/
      app/
        layout.tsx                  # Root layout, metadata
        page.tsx                    # Dashboard page
        globals.css                 # Design tokens, CSS variables, animations
      components/
        Navbar.tsx                  # Sticky nav, live indicator, theme toggle
        Ticker.tsx                  # Infinite scroll ticker
        PriceCard.tsx               # Commodity price card
        StatsBar.tsx                # Gainers / losers / top movers
        charts/
          Sparkline.tsx             # SVG sparkline with fill
      hooks/
        usePrices.ts                # WS + polling, auto-reconnect
        useTheme.ts                 # Dark/light mode
      lib/
        api.ts                      # Typed API client
        constants.ts                # Commodity config, API URLs
        utils.ts                    # Format helpers, sparkline math
      types/
        index.ts                    # TypeScript interfaces
```

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | /api/prices | All commodity prices |
| GET | /api/prices/:id | Single commodity |
| GET | /api/ticker | Lightweight ticker data |
| GET | /api/health | Health check |
| WS | /ws/prices | Live price stream |

## Commodity IDs

`crude-wti`, `crude-brent`, `natural-gas`, `gold`, `silver`, `copper`, `aluminium`, `platinum`

## Design System

- Font UI: Outfit (Google Fonts)
- Font mono (prices): JetBrains Mono
- Primary orange: `#D46A00`
- Background dark: `#080808`
- Price up: `#22C55E`
- Price down: `#EF4444`
- No emoji anywhere in the project

## Deployment (Phase 4)

Frontend: `vercel deploy` from `/frontend`

Backend:
```
fly launch --name commoditychain-api --region bom
fly deploy
```

## Phase Roadmap

- Phase 1 (current): Dashboard, live prices, WebSocket, dark mode
- Phase 2: Price Explorer charts, News Feed, Converter, Watchlist
- Phase 3: AI Analyst (Groq), Shock Simulator, Price Alerts
- Phase 4: Global map, correlation matrix, export, deployment
