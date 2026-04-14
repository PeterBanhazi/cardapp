"""
redis_chat_state.py
────────────────────────────────────────────────────────────────
Chat-request state machine backed by Redis hashes.

Key layout
──────────
  chat:req:{req_id}          → hash  { req_id, user_from, user_to,
                                        status, created_at, updated_at }

  chat:pair:{a}:{b}          → str   current req_id for this pair
                               (a < b alphabetically, keeps it unique)

  chat:user:{username}:reqs  → set   all req_ids the user is involved in

Valid transitions
──────────────────────────────────────────────────────────────────
  (none)      ──► pending     user_from sends request
  pending     ──► accepted    user_to accepts
  pending     ──► rejected    user_to rejects
  pending     ──► cancelled   user_from cancels
  accepted    ──► closed      either party closes
  rejected    ──► pending     either party sends a new request
  cancelled   ──► pending     either party sends a new request
  closed      ──► pending     either party sends a new request
"""

import time
import uuid

from django_redis import get_redis_connection
from channels.db import database_sync_to_async

REQ_TTL    = 60 * 60 * 24 * 7   # 7 days — long enough to survive reconnects
PAIR_TTL   = REQ_TTL
USER_TTL   = REQ_TTL

# States
PENDING   = "pending"
ACCEPTED  = "active"
REJECTED  = "rejected"
CANCELLED = "cancelled"
CLOSED    = "closed"

# Which transitions are legal, keyed by current state
ALLOWED_TRANSITIONS: dict[str | None, set[str]] = {
    None:      {PENDING},
    PENDING:   {ACCEPTED, REJECTED, CANCELLED},
    ACCEPTED:  {CLOSED},
    REJECTED:  {PENDING},
    CANCELLED: {PENDING},
    CLOSED:    {PENDING},
}

# Who is allowed to drive each transition
TRANSITION_ACTOR = {
    PENDING:   "from",        # only user_from opens a request
    ACCEPTED:  "to",          # only user_to accepts
    REJECTED:  "to",          # only user_to rejects
    CANCELLED: "from",        # only user_from cancels
    CLOSED:    "both",        # either party may close
}


# ──────────────────────────────────────────────────────────────
#  Internal helpers
# ──────────────────────────────────────────────────────────────

def _pair_key(a: str, b: str) -> str:
    """Canonical key independent of who is 'from' and who is 'to'."""
    return f"chat:pair:{min(a,b)}:{max(a,b)}"


def _req_key(req_id: str) -> str:
    return f"chat:req:{req_id}"


def _user_reqs_key(username: str) -> str:
    return f"chat:user:{username}:reqs"


def _now_ts() -> str:
    return str(int(time.time()))


# ──────────────────────────────────────────────────────────────
#  Core state-machine operations  (sync — wrap with @database_sync_to_async)
# ──────────────────────────────────────────────────────────────

class ChatStateError(Exception):
    """Raised when a transition is illegal."""


def get_request(req_id: str) -> dict | None:
    """Return the full request hash or None if it doesn't exist."""
    r = get_redis_connection("default")
    data = r.hgetall(_req_key(req_id))
    if not data:
        return None
    # redis returns bytes
    return {k.decode(): v.decode() for k, v in data.items()}


def get_pair_request(user_from: str, user_to: str) -> dict | None:
    """Return the active request between two users, or None."""
    r = get_redis_connection("default")
    req_id = r.get(_pair_key(user_from, user_to))
    if not req_id:
        return None
    return get_request(req_id.decode())


def get_user_active_requests(username: str) -> list[dict]:
    """Return all non-terminal requests the user is part of."""
    r = get_redis_connection("default")
    req_ids = r.smembers(_user_reqs_key(username))
    results = []
    for rid in req_ids:
        req = get_request(rid.decode())
        if req and req["status"] in (PENDING, ACCEPTED):
            results.append(req)
    return results


def transition(
    actor: str,          # username of the person driving the change
    target_status: str,
    req_id: str | None = None,
    user_from: str | None = None,
    user_to: str | None = None,
) -> dict:
    """
    Drive the state machine.

    For PENDING (new request) pass user_from + user_to; req_id is created.
    For all other transitions pass req_id; actor is validated against the request.

    Returns the updated (or newly created) request dict.
    Raises ChatStateError on illegal transitions or wrong actor.
    """
    r = get_redis_connection("default")

    # ── PENDING: create a brand-new request ──────────────────────────
    if target_status == PENDING:
        if not user_from or not user_to:
            raise ChatStateError("user_from and user_to required to open a request.")

        # Check for an active (pending/accepted) request between the pair
        existing = get_pair_request(user_from, user_to)
        if existing and existing["status"] in (PENDING, ACCEPTED):
            raise ChatStateError(
                f"Active request {existing['req_id']} already exists "
                f"(status={existing['status']}). Cannot create a new one."
            )

        req_id = str(uuid.uuid4())
        now = _now_ts()
        req = {
            "req_id":     req_id,
            "user_from":  user_from,
            "user_to":    user_to,
            "status":     PENDING,
            "created_at": now,
            "updated_at": now,
        }
        pipe = r.pipeline()
        pipe.hset(_req_key(req_id), mapping=req)
        pipe.expire(_req_key(req_id), REQ_TTL)
        pipe.set(_pair_key(user_from, user_to), req_id, ex=PAIR_TTL)
        pipe.sadd(_user_reqs_key(user_from), req_id)
        pipe.expire(_user_reqs_key(user_from), USER_TTL)
        pipe.sadd(_user_reqs_key(user_to), req_id)
        pipe.expire(_user_reqs_key(user_to), USER_TTL)
        pipe.execute()
        return req

    # ── All other transitions: operate on an existing request ─────────
    if not req_id:
        raise ChatStateError("req_id required for non-pending transitions.")

    req = get_request(req_id)
    if not req:
        raise ChatStateError(f"Request {req_id} not found.")

    current_status = req["status"]
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if target_status not in allowed:
        raise ChatStateError(
            f"Cannot transition from '{current_status}' to '{target_status}'."
        )

    # Actor check
    actor_rule = TRANSITION_ACTOR[target_status]
    if actor_rule == "from" and actor != req["user_from"]:
        raise ChatStateError(f"Only {req['user_from']} can set status='{target_status}'.")
    if actor_rule == "to" and actor != req["user_to"]:
        raise ChatStateError(f"Only {req['user_to']} can set status='{target_status}'.")
    # "both" → no restriction

    now = _now_ts()
    pipe = r.pipeline()
    pipe.hset(_req_key(req_id), mapping={"status": target_status, "updated_at": now})
    pipe.expire(_req_key(req_id), REQ_TTL)
    pipe.execute()

    req["status"]     = target_status
    req["updated_at"] = now
    return req


# ──────────────────────────────────────────────────────────────
#  Async wrappers
# ──────────────────────────────────────────────────────────────

@database_sync_to_async
def async_transition(**kwargs) -> dict:
    return transition(**kwargs)


@database_sync_to_async
def async_get_pair_request(user_from: str, user_to: str) -> dict | None:
    return get_pair_request(user_from, user_to)


@database_sync_to_async
def async_get_user_active_requests(username: str) -> list[dict]:
    return get_user_active_requests(username)
