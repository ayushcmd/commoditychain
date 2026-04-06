from fastapi import APIRouter, HTTPException
from models.commodity import Commodity
from services.commodity_service import get_all_prices, get_price_by_id

router = APIRouter(prefix="/api", tags=["prices"])


@router.get("/prices", response_model=list[Commodity])
async def list_prices():
    """Return all commodity prices (served from cache, TTL 55s)."""
    return await get_all_prices()


@router.get("/prices/{commodity_id}", response_model=Commodity)
async def get_price(commodity_id: str):
    """Return a single commodity by id."""
    commodity = await get_price_by_id(commodity_id)
    if not commodity:
        raise HTTPException(status_code=404, detail=f"Commodity '{commodity_id}' not found")
    return commodity


@router.get("/ticker")
async def ticker():
    """Lightweight ticker payload — name, price, change% only."""
    commodities = await get_all_prices()
    return [
        {
            "id": c.id,
            "name": c.name,
            "price": c.price,
            "changePercent": c.changePercent,
            "currency": c.currency,
        }
        for c in commodities
    ]


@router.get("/health")
async def health():
    return {"status": "ok"}
