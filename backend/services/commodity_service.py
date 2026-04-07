"""
Commodity service — yfinance for all real prices.
Falls back to GBM simulation if yfinance call fails.
"""

import asyncio
import logging
import math
import os
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

import yfinance as yf

from models.commodity import Commodity, PricePoint

logger = logging.getLogger(__name__)

COMMODITIES_CONFIG = [
    {"id": "crude-wti",   "name": "Crude Oil WTI", "ticker": "WTI",   "yf_symbol": "CL=F",  "unit": "per barrel",  "category": "energy",  "currency": "USD", "seed": 111.00, "vol": 0.012},
    {"id": "crude-brent", "name": "Brent Crude",   "ticker": "BRENT", "yf_symbol": "BZ=F",  "unit": "per barrel",  "category": "energy",  "currency": "USD", "seed": 110.00, "vol": 0.011},
    {"id": "natural-gas", "name": "Natural Gas",   "ticker": "NG=F",  "yf_symbol": "NG=F",  "unit": "per MMBtu",   "category": "energy",  "currency": "USD", "seed": 3.80,   "vol": 0.022},
    {"id": "gold",        "name": "Gold",          "ticker": "GC=F",  "yf_symbol": "GC=F",  "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 4630.00,"vol": 0.006},
    {"id": "silver",      "name": "Silver",        "ticker": "SI=F",  "yf_symbol": "SI=F",  "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 72.00,  "vol": 0.014},
    {"id": "copper",      "name": "Copper",        "ticker": "HG=F",  "yf_symbol": "HG=F",  "unit": "per lb",      "category": "metals",  "currency": "USD", "seed": 4.80,   "vol": 0.009},
    {"id": "aluminium",   "name": "Aluminium",     "ticker": "ALI=F", "yf_symbol": "ALI=F", "unit": "per lb",      "category": "metals",  "currency": "USD", "seed": 1.12,   "vol": 0.008},
    {"id": "platinum",    "name": "Platinum",      "ticker": "PL=F",  "yf_symbol": "PL=F",  "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 980.00, "vol": 0.010},
]

_cache: dict[str, Commodity] = {}
_cache_ts: Optional[datetime] = None
_price_state: dict[str, float] = {}
CACHE_TTL = 60


# ── yfinance fetch ───────────────────────────────────────────────

def _fetch_yfinance(symbol: str) -> Optional[dict]:
    try:
        tk = yf.Ticker(symbol)
        info = tk.fast_info

        price = info.last_price
        if not price or math.isnan(price):
            return None

        prev_close = info.previous_close or price
        day_high   = info.day_high or price
        day_low    = info.day_low or price

        hist = tk.history(period="30d", interval="1d")
        history = []
        for idx, row in hist.iterrows():
            close = row["Close"]
            if close and not math.isnan(close):
                history.append(PricePoint(
                    timestamp=idx.strftime("%Y-%m-%d"),
                    price=round(float(close), 4)
                ))

        return {
            "price":      round(float(price), 4),
            "prev_close": round(float(prev_close), 4),
            "high24":     round(float(day_high), 4),
            "low24":      round(float(day_low), 4),
            "history":    history,
        }

    except Exception as exc:
        logger.warning("yfinance error for %s: %s", symbol, exc)
        return None


# ── GBM simulation fallback ──────────────────────────────────────

def _simulate_price(cid: str, seed: float, vol: float) -> float:
    current = _price_state.get(cid, seed)
    drift   = 0.0001 * (seed - current) / seed
    shock   = random.gauss(drift, vol * 0.3)
    new_p   = max(seed * 0.85, min(seed * 1.15, current * math.exp(shock)))
    _price_state[cid] = new_p
    return round(new_p, 4)


def _build_history(cid: str, price: float, seed: float, vol: float) -> list[PricePoint]:
    pts, p = [], price * random.uniform(0.94, 1.06)
    now = datetime.now(timezone.utc)
    for i in range(30, -1, -1):
        p = max(seed * 0.82, min(seed * 1.18, p * math.exp(random.gauss(0, vol * 0.5))))
        pts.append(PricePoint(timestamp=(now - timedelta(days=i)).strftime("%Y-%m-%d"), price=round(p, 4)))
    pts[-1] = PricePoint(timestamp=now.strftime("%Y-%m-%d"), price=price)
    return pts


# ── Build Commodity object ───────────────────────────────────────

def _build_commodity(cfg: dict, price: float, prev_close: float, high24: float, low24: float, history: list, is_live: bool) -> Commodity:
    change     = round(price - prev_close, 4)
    change_pct = round((change / prev_close * 100) if prev_close else 0.0, 4)
    source     = "live" if is_live else "sim"
    logger.info("%s %-14s  $%10.4f  %+.2f%%  [%s]", "OK" if is_live else "SIM", cfg["id"], price, change_pct, source)
    return Commodity(
        id=cfg["id"],
        name=cfg["name"],
        ticker=cfg["ticker"],
        unit=cfg["unit"],
        category=cfg["category"],
        currency=cfg["currency"],
        price=price,
        previousClose=round(prev_close, 4),
        change=change,
        changePercent=change_pct,
        high24h=round(high24, 4),
        low24h=round(low24, 4),
        volume=round(random.uniform(80_000, 250_000), 0),
        marketStatus="open",
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        history=history,
    )


# ── Main fetch ───────────────────────────────────────────────────

async def _fetch_all() -> list[Commodity]:
    loop    = asyncio.get_event_loop()
    results = []

    for i, cfg in enumerate(COMMODITIES_CONFIG):
        if i > 0:
            await asyncio.sleep(0.3)

        yf_data = await loop.run_in_executor(None, _fetch_yfinance, cfg["yf_symbol"])

        if yf_data:
            c = _build_commodity(
                cfg,
                yf_data["price"], yf_data["prev_close"],
                yf_data["high24"], yf_data["low24"],
                yf_data["history"], is_live=True
            )
        else:
            price = _simulate_price(cfg["id"], cfg["seed"], cfg["vol"])
            prev  = price / math.exp(random.gauss(0, cfg["vol"] * 0.4))
            hist  = _build_history(cfg["id"], price, cfg["seed"], cfg["vol"])
            c = _build_commodity(cfg, price, prev, price * 1.005, price * 0.995, hist, is_live=False)

        results.append(c)

    return results


# ── Cache ────────────────────────────────────────────────────────

def _stale() -> bool:
    if not _cache_ts:
        return True
    return (datetime.now(timezone.utc) - _cache_ts).total_seconds() > CACHE_TTL


async def get_all_prices() -> list[Commodity]:
    global _cache, _cache_ts
    if _stale():
        fresh = await _fetch_all()
        if fresh:
            _cache    = {c.id: c for c in fresh}
            _cache_ts = datetime.now(timezone.utc)
            logger.info("Cache updated — %d commodities", len(fresh))
    return list(_cache.values())


async def get_price_by_id(cid: str) -> Optional[Commodity]:
    return next((c for c in await get_all_prices() if c.id == cid), None)