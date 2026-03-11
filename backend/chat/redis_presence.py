import uuid
from django_redis import get_redis_connection
from channels.db import database_sync_to_async

# TTL in seconds — a dangling key (e.g. after a crash) auto-expires
PRESENCE_TTL = 120


# ─────────────────────────────────────────────
#  Low-level Redis ops  (sync, called via @database_sync_to_async)
# ─────────────────────────────────────────────

def _key(user_id):
    return f"presence:user:{user_id}:connections"


def redis_add_connection(user_id: int, socket_id: str) -> int:
    r = get_redis_connection("default")
    key = _key(user_id)
    r.sadd(key, socket_id)
    r.expire(key, PRESENCE_TTL)          # refresh TTL on every new tab/device
    return r.scard(key)                  # total active connections for this user


def redis_remove_connection(user_id: int, socket_id: str) -> int:
    r = get_redis_connection("default")
    key = _key(user_id)
    r.srem(key, socket_id)
    count = r.scard(key)
    if count == 0:
        r.delete(key)                    # clean up immediately instead of waiting for TTL
    return count


def redis_is_online(user_id: int) -> bool:
    r = get_redis_connection("default")
    return r.scard(_key(user_id)) > 0


def redis_refresh_ttl(user_id: int) -> None:
    """Call on heartbeat so tabs that stay open never expire."""
    r = get_redis_connection("default")
    r.expire(_key(user_id), PRESENCE_TTL)


# ─────────────────────────────────────────────
#  Async wrappers — drop these straight into your consumer
# ─────────────────────────────────────────────

@database_sync_to_async
def async_add_connection(user_id: int, socket_id: str) -> int:
    return redis_add_connection(user_id, socket_id)


@database_sync_to_async
def async_remove_connection(user_id: int, socket_id: str) -> int:
    return redis_remove_connection(user_id, socket_id)


@database_sync_to_async
def async_is_online(user_id: int) -> bool:
    return redis_is_online(user_id)


@database_sync_to_async
def async_refresh_ttl(user_id: int) -> None:
    redis_refresh_ttl(user_id)
