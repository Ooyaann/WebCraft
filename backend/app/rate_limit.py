"""Lightweight in-memory rate limiting for abuse-prone endpoints (e.g. AI proxy).

Keyed per authenticated user when available, otherwise per client IP. This is a
single-process fixed-window limiter which is sufficient for a single-instance
deployment (e.g. one container / HF Space). For multi-worker or horizontally
scaled deployments, back this with Redis instead.
"""
import time
from collections import defaultdict, deque
from typing import Optional

from fastapi import Depends, HTTPException, Request, status

from app.models import User
from app.routers.auth import get_current_user_optional

# key -> deque[monotonic timestamps of recent hits]
_hits: dict[str, deque] = defaultdict(deque)


def rate_limiter(max_requests: int, window_seconds: int):
    """Build a FastAPI dependency that enforces `max_requests` per `window_seconds`."""

    async def dependency(
        request: Request,
        user: Optional[User] = Depends(get_current_user_optional),
    ) -> None:
        if user is not None:
            key = f"user:{user.id}"
        else:
            client = request.client.host if request.client else "unknown"
            key = f"ip:{client}"

        now = time.monotonic()
        cutoff = now - window_seconds
        hits = _hits[key]
        while hits and hits[0] < cutoff:
            hits.popleft()

        if len(hits) >= max_requests:
            retry_after = int(window_seconds - (now - hits[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Terlalu banyak permintaan ke layanan AI. Silakan tunggu sebentar lalu coba lagi.",
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)

    return dependency


# 20 AI calls per minute per user is generous for interactive tutoring while
# still blocking scripted abuse of the Gemini quota/billing.
ai_rate_limit = rate_limiter(max_requests=20, window_seconds=60)
