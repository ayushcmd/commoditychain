"""
AI Analyst router — Groq Llama 3.3 70B.
Injects live commodity prices + recent context into every prompt.
Free tier: ~14,400 requests/day on groq.com (no credit card needed).
Get key at: console.groq.com → API Keys → Create
"""

import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from services.commodity_service import get_all_prices

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analyst"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"

PERSONA_PROMPTS = {
    "normal": (
        "You are a friendly commodity market analyst. Explain things simply, avoid jargon. "
        "Use everyday analogies. Keep responses concise — 3 to 5 sentences max. "
        "Always end with one practical takeaway for a regular person."
    ),
    "trader": (
        "You are a professional commodity trader with 20 years experience. "
        "Be direct, technical, and data-focused. Mention key levels, momentum, and macro drivers. "
        "Use trading terminology. 4 to 6 sentences. Include a risk note."
    ),
    "student": (
        "You are a patient economics teacher. Explain the fundamentals clearly. "
        "Connect price movements to supply, demand, geopolitics, and macroeconomics. "
        "Use structured thinking. 4 to 6 sentences. End with a concept the student should research further."
    ),
}


class AnalystRequest(BaseModel):
    question: str
    persona: str = "normal"  # normal | trader | student


class AnalystResponse(BaseModel):
    answer: str
    persona: str
    model: str
    live_context_used: bool


def _build_price_context(commodities) -> str:
    lines = ["Current live commodity prices:"]
    for c in commodities:
        direction = "up" if c.changePercent >= 0 else "down"
        lines.append(
            f"  {c.name}: ${c.price:.2f} ({c.changePercent:+.2f}% today, {direction})"
        )
    return "\n".join(lines)


@router.post("/analyst", response_model=AnalystResponse)
async def ask_analyst(req: AnalystRequest):
    persona = req.persona if req.persona in PERSONA_PROMPTS else "normal"
    system_prompt = PERSONA_PROMPTS[persona]

    # Inject live prices as context
    commodities = await get_all_prices()
    price_context = _build_price_context(commodities) if commodities else ""

    user_message = req.question
    if price_context:
        user_message = f"{price_context}\n\nUser question: {req.question}"

    if not GROQ_API_KEY:
        # Graceful fallback — return a canned response explaining setup
        return AnalystResponse(
            answer=(
                "AI Analyst is not configured yet. "
                "To enable it: get a free API key at console.groq.com, "
                "then add GROQ_API_KEY=your_key to your backend .env file and restart the server. "
                "The free tier gives you ~14,400 requests per day with Llama 3.3 70B."
            ),
            persona=persona,
            model="not-configured",
            live_context_used=False,
        )

    try:
        import httpx
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_message},
                    ],
                    "max_tokens": 400,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            answer = data["choices"][0]["message"]["content"].strip()

        return AnalystResponse(
            answer=answer,
            persona=persona,
            model=MODEL,
            live_context_used=bool(price_context),
        )

    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        return AnalystResponse(
            answer=f"Could not reach AI service right now. Error: {str(exc)[:120]}. Please try again in a moment.",
            persona=persona,
            model=MODEL,
            live_context_used=False,
        )
