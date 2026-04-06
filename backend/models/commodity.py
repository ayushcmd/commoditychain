from pydantic import BaseModel
from typing import Literal


class PricePoint(BaseModel):
    timestamp: str
    price: float


class Commodity(BaseModel):
    id: str
    name: str
    ticker: str
    unit: str
    category: Literal["energy", "metals", "agriculture", "other"]
    price: float
    previousClose: float
    change: float
    changePercent: float
    high24h: float
    low24h: float
    volume: float
    marketStatus: Literal["open", "closed", "pre-market"]
    lastUpdated: str
    history: list[PricePoint]
    currency: str = "USD"
