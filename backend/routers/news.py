"""
News router — fetches commodity-related headlines from NewsAPI.
Falls back to curated realistic headlines if API key not set.
Free tier: 100 requests/day at newsapi.org
"""

import os
import logging
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import APIRouter, Query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["news"])

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")

COMMODITY_QUERIES: dict[str, str] = {
    "all":         "commodity prices OR crude oil OR gold OR silver OR natural gas",
    "crude-wti":   "crude oil WTI prices",
    "crude-brent": "brent crude oil",
    "natural-gas": "natural gas prices energy",
    "gold":        "gold prices commodities",
    "silver":      "silver prices metals",
    "copper":      "copper prices metals",
    "aluminium":   "aluminium prices metals",
    "platinum":    "platinum prices metals",
}

MOCK_NEWS = [
    {"id": "1", "title": "Gold surges above $3,300 as Fed signals rate pause", "source": "Reuters", "url": "https://reuters.com", "publishedAt": "2025-04-05T08:30:00Z", "commodity": "gold", "sentiment": "positive", "readTime": 3, "description": "Gold prices climbed to multi-week highs after Federal Reserve officials indicated a potential pause in interest rate hikes amid cooling inflation data."},
    {"id": "2", "title": "Crude oil slips on demand concerns from China slowdown", "source": "Bloomberg", "url": "https://bloomberg.com", "publishedAt": "2025-04-05T07:15:00Z", "commodity": "crude-wti", "sentiment": "negative", "readTime": 4, "description": "WTI crude fell 0.8% as manufacturing data from China came in weaker than expected, raising concerns about near-term demand for energy commodities."},
    {"id": "3", "title": "Natural gas prices rise on cold weather forecasts across Europe", "source": "Financial Times", "url": "https://ft.com", "publishedAt": "2025-04-05T06:00:00Z", "commodity": "natural-gas", "sentiment": "positive", "readTime": 3, "description": "European natural gas futures climbed 2.3% after weather models showed below-average temperatures forecast for the next two weeks across key consuming regions."},
    {"id": "4", "title": "Copper hits 3-week high on supply disruption fears in Chile", "source": "CNBC", "url": "https://cnbc.com", "publishedAt": "2025-04-04T14:00:00Z", "commodity": "copper", "sentiment": "positive", "readTime": 3, "description": "Copper prices surged to their highest level in three weeks after reports emerged of potential strike action at Escondida, the world largest copper mine."},
    {"id": "5", "title": "Silver outperforms gold as industrial demand outlook improves", "source": "Kitco", "url": "https://kitco.com", "publishedAt": "2025-04-04T11:30:00Z", "commodity": "silver", "sentiment": "positive", "readTime": 2, "description": "Silver prices outpaced gold gains this week as analysts revised upward their forecasts for solar panel production, a key driver of silver industrial demand."},
    {"id": "6", "title": "OPEC maintains output cuts, Brent crude finds support at $85", "source": "Reuters", "url": "https://reuters.com", "publishedAt": "2025-04-04T09:00:00Z", "commodity": "crude-brent", "sentiment": "neutral", "readTime": 4, "description": "OPEC confirmed it would maintain current production quotas through the second quarter, providing a floor for Brent crude prices near the $85 per barrel level."},
    {"id": "7", "title": "Platinum deficit expected to widen in 2025 on EV demand", "source": "World Platinum Council", "url": "https://platinuminvestment.com", "publishedAt": "2025-04-03T12:00:00Z", "commodity": "platinum", "sentiment": "positive", "readTime": 5, "description": "The World Platinum Investment Council raised its 2025 deficit forecast as hydrogen fuel cell vehicle production accelerates, consuming more platinum catalyst material."},
    {"id": "8", "title": "Aluminium prices under pressure as US tariff exemptions expire", "source": "Metal Bulletin", "url": "https://metalbulletin.com", "publishedAt": "2025-04-03T08:30:00Z", "commodity": "aluminium", "sentiment": "negative", "readTime": 3, "description": "Aluminium futures dropped as temporary tariff exemptions for several major exporters are set to expire, potentially disrupting trade flows to US consumers."},
    {"id": "9", "title": "India gold imports hit record high ahead of wedding season", "source": "Economic Times", "url": "https://economictimes.com", "publishedAt": "2025-04-02T10:00:00Z", "commodity": "gold", "sentiment": "positive", "readTime": 3, "description": "India gold imports surged 34% year-over-year in March as jewellers stocked ahead of the peak wedding and festival season, providing strong physical demand support."},
    {"id": "10", "title": "Natural gas storage deficit narrows, tempering price rally", "source": "EIA", "url": "https://eia.gov", "publishedAt": "2025-04-02T08:00:00Z", "commodity": "natural-gas", "sentiment": "neutral", "readTime": 2, "description": "US natural gas storage levels closed the gap with the 5-year average after a warmer-than-expected end to winter, reducing the urgency of the ongoing price rally."},
    {"id": "11", "title": "Copper demand from data centres to double by 2030, says Goldman", "source": "Goldman Sachs", "url": "https://goldmansachs.com", "publishedAt": "2025-04-01T14:00:00Z", "commodity": "copper", "sentiment": "positive", "readTime": 4, "description": "Goldman Sachs raised its long-term copper price target citing surging demand from AI data centre infrastructure, which requires significantly more copper wiring than traditional buildings."},
    {"id": "12", "title": "Silver industrial demand hits record on photovoltaic expansion", "source": "Silver Institute", "url": "https://silverinstitute.org", "publishedAt": "2025-04-01T09:00:00Z", "commodity": "silver", "sentiment": "positive", "readTime": 3, "description": "The Silver Institute reported industrial fabrication demand reached an all-time high driven by photovoltaic panel manufacturing in China and India."},
]


async def _fetch_newsapi(query: str) -> list[dict]:
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": 12,
        "apiKey": NEWS_API_KEY,
    }
    async with httpx.AsyncClient(timeout=8) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        articles = data.get("articles", [])
        result = []
        for i, a in enumerate(articles):
            result.append({
                "id": str(i),
                "title": a.get("title", ""),
                "source": a.get("source", {}).get("name", ""),
                "url": a.get("url", ""),
                "publishedAt": a.get("publishedAt", ""),
                "commodity": "all",
                "sentiment": "neutral",
                "readTime": max(2, len(a.get("description", "")) // 200),
                "description": a.get("description", ""),
            })
        return result


@router.get("/news")
async def get_news(
    commodity: str = Query(default="all"),
    limit: int = Query(default=12, le=30),
):
    if NEWS_API_KEY:
        try:
            query = COMMODITY_QUERIES.get(commodity, COMMODITY_QUERIES["all"])
            articles = await _fetch_newsapi(query)
            return articles[:limit]
        except Exception as exc:
            logger.warning("NewsAPI failed: %s — returning mock data", exc)

    # Filter mock by commodity
    if commodity == "all":
        filtered = MOCK_NEWS
    else:
        filtered = [n for n in MOCK_NEWS if n["commodity"] == commodity or commodity == "all"]
        if not filtered:
            filtered = MOCK_NEWS

    return filtered[:limit]
