import json

import redis

from services.shared.config import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def cache_prediction(application_id: str, payload: dict) -> None:
    key = f"prediction:{application_id}"
    redis_client.setex(key, settings.REDIS_CACHE_TTL_SECONDS, json.dumps(payload))


def get_cached_prediction(application_id: str) -> dict | None:
    key = f"prediction:{application_id}"
    cached = redis_client.get(key)
    if cached is None:
        return None
    try:
        return json.loads(cached)
    except json.JSONDecodeError:
        return None


def invalidate_prediction_cache(application_id: str) -> None:
    redis_client.delete(f"prediction:{application_id}")
