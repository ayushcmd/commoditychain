"""
Export router — download commodity price history as CSV or JSON.
"""
import io
import csv
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse, JSONResponse
from services.commodity_service import get_all_prices, get_price_by_id

router = APIRouter(prefix="/api", tags=["export"])


@router.get("/export/{commodity_id}")
async def export_prices(
    commodity_id: str,
    format: str = Query(default="csv", enum=["csv", "json"]),
):
    commodity = await get_price_by_id(commodity_id)
    if not commodity:
        return JSONResponse(status_code=404, content={"error": "Commodity not found"})

    history = commodity.history
    filename_base = f"{commodity_id}-prices-{datetime.now(timezone.utc).strftime('%Y%m%d')}"

    if format == "json":
        data = {
            "commodity": commodity.name,
            "ticker": commodity.ticker,
            "currency": commodity.currency,
            "unit": commodity.unit,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "current_price": commodity.price,
            "history": [{"date": p.timestamp[:10], "price": p.price} for p in history],
        }
        return StreamingResponse(
            io.BytesIO(json.dumps(data, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.json"},
        )

    # CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["date", "price", "currency", "commodity", "unit"])
    for p in history:
        writer.writerow([p.timestamp[:10], p.price, commodity.currency, commodity.name, commodity.unit])

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename_base}.csv"},
    )


@router.get("/export")
async def export_all(format: str = Query(default="csv", enum=["csv", "json"])):
    """Export latest prices for all commodities."""
    commodities = await get_all_prices()
    filename_base = f"commoditychain-all-{datetime.now(timezone.utc).strftime('%Y%m%d')}"

    if format == "json":
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "commodities": [
                {
                    "id": c.id, "name": c.name, "ticker": c.ticker,
                    "price": c.price, "change_pct": c.changePercent,
                    "currency": c.currency, "unit": c.unit,
                    "high_24h": c.high24h, "low_24h": c.low24h,
                }
                for c in commodities
            ],
        }
        return StreamingResponse(
            io.BytesIO(json.dumps(data, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.json"},
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "ticker", "price", "change_pct", "currency", "unit", "high_24h", "low_24h"])
    for c in commodities:
        writer.writerow([c.id, c.name, c.ticker, c.price, c.changePercent, c.currency, c.unit, c.high24h, c.low24h])

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename_base}.csv"},
    )
