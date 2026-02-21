import json
import logging

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a sales intelligence assistant. Given a lead's name and email, "
    "return a JSON object with exactly two keys:\n"
    '- "summary": 2-3 sentences describing the lead based on their name and email domain.\n'
    '- "outreach_email": a short, personalized first-contact email to send to the lead.\n'
    "Return ONLY the JSON object, no markdown fences or extra text."
)

_FALLBACK = {
    "summary": "Unable to generate summary at this time.",
    "outreach_email": "Unable to generate outreach email at this time.",
}


async def enrich_lead(name: str, email: str) -> dict:
    """Call Claude API to generate a lead summary and personalized outreach email."""
    if not settings.AI_API_KEY:
        logger.warning("AI_API_KEY not configured; returning fallback response")
        return _FALLBACK

    client = anthropic.Anthropic(api_key=settings.AI_API_KEY)
    user_message = f"Lead name: {name}\nLead email: {email}"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
            timeout=settings.AI_API_TIMEOUT,
        )
        raw = message.content[0].text
        return json.loads(raw)
    except (anthropic.APIError, anthropic.APITimeoutError) as exc:
        logger.error("AI API error during lead enrichment: %s", exc)
        return _FALLBACK
    except (json.JSONDecodeError, IndexError, KeyError) as exc:
        logger.error("Failed to parse AI response: %s", exc)
        return _FALLBACK
