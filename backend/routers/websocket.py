import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.commodity_service import get_all_prices

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])

BROADCAST_INTERVAL = 60  # seconds


class ConnectionManager:
    def __init__(self):
        self._clients: set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self._clients.add(ws)
        logger.info("WS client connected — total: %d", len(self._clients))

    def disconnect(self, ws: WebSocket):
        self._clients.discard(ws)
        logger.info("WS client disconnected — total: %d", len(self._clients))

    async def broadcast(self, payload: str):
        dead: set[WebSocket] = set()
        for ws in self._clients:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self._clients.discard(ws)

    @property
    def count(self) -> int:
        return len(self._clients)


manager = ConnectionManager()


async def _broadcast_loop():
    """Background task: fetch prices and push to all WS clients every 60s."""
    while True:
        await asyncio.sleep(BROADCAST_INTERVAL)
        if manager.count == 0:
            continue
        try:
            commodities = await get_all_prices()
            payload = json.dumps([c.model_dump() for c in commodities])
            await manager.broadcast(payload)
            logger.debug("Broadcast sent to %d clients", manager.count)
        except Exception as exc:
            logger.error("Broadcast error: %s", exc)


@router.websocket("/ws/prices")
async def ws_prices(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send current data immediately on connect
        commodities = await get_all_prices()
        payload = json.dumps([c.model_dump() for c in commodities])
        await websocket.send_text(payload)

        # Keep connection alive, waiting for disconnect
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=120)
            except asyncio.TimeoutError:
                await websocket.send_text('{"ping":true}')
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.warning("WS error: %s", exc)
    finally:
        manager.disconnect(websocket)
