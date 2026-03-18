"""
friendship/consumers.py

Real-time WebSocket consumer for friendship events using Django Channels.

Connect:  ws://host/ws/friends/
Each authenticated user joins their own personal group: "user_{user_id}_friends"

Events pushed to the client (JSON):
  { "type": "friend_request.received",  "request": {...} }
  { "type": "friend_request.accepted",  "request": {...} }
  { "type": "friend_request.rejected",  "request": {...} }
  { "type": "friend_request.cancelled", "request": {...} }
  { "type": "friendship.removed",        "with_user_id": <int> }
  { "type": "error",                     "message": "..." }

Usage from views / signals:
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}_friends",
        {
            "type": "notify_friend_event",
            "event_type": "friend_request.received",
            "payload": FriendRequestSerializer(fr, context={...}).data,
        },
    )
"""

import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class FriendshipConsumer(AsyncWebsocketConsumer):
    """
    Personal friendship notification channel for a single authenticated user.

    Group name pattern: user_{user_id}_friends
    """

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(self):
        user = self.scope.get("user")

        if user is None or not await self._is_authenticated(user):
            logger.warning("Unauthenticated WebSocket connection attempt rejected.")
            await self.close(code=4001)
            return

        self.user = user
        self.group_name = self._group_name(user.pk)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.debug("WS connected: user=%s group=%s", user.pk, self.group_name)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.debug(
                "WS disconnected: user=%s code=%s", self.user.pk, close_code
            )

    # ------------------------------------------------------------------
    # Inbound messages from client (optional — kept minimal)
    # ------------------------------------------------------------------

    async def receive(self, text_data=None, bytes_data=None):
        """
        Clients may send a ping to keep the connection alive.
        Any other messages are ignored (all mutations go through the REST API).
        """
        if not text_data:
            return
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self._send_error("Invalid JSON.")
            return

        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))
        else:
            await self._send_error(
                "This channel is read-only. Use the REST API to perform actions."
            )

    # ------------------------------------------------------------------
    # Outbound — group message handlers
    # These are called by channel_layer.group_send() from views/signals.
    # ------------------------------------------------------------------

    async def notify_friend_event(self, event: dict):
        """
        Generic handler. The view layer sends:
          {
            "type": "notify_friend_event",
            "event_type": "<one of the types listed at the top>",
            "payload": { ...serialized data... },
          }
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": event["event_type"],
                    **event.get("payload", {}),
                }
            )
        )

    # Convenience typed handlers (views may call these directly by type name)

    async def friend_request_received(self, event: dict):
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request.received", "request": event["request"]}
            )
        )

    async def friend_request_accepted(self, event: dict):
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request.accepted", "request": event["request"]}
            )
        )

    async def friend_request_rejected(self, event: dict):
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request.rejected", "request": event["request"]}
            )
        )

    async def friend_request_cancelled(self, event: dict):
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request.cancelled", "request": event["request"]}
            )
        )

    async def friendship_removed(self, event: dict):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "friendship.removed",
                    "with_user_id": event["with_user_id"],
                }
            )
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _group_name(user_id: int) -> str:
        return f"user_{user_id}_friends"

    async def _send_error(self, message: str):
        await self.send(
            text_data=json.dumps({"type": "error", "message": message})
        )

    @database_sync_to_async
    def _is_authenticated(self, user) -> bool:
        return user.is_authenticated


# ---------------------------------------------------------------------------
# Helper: notify both parties of a friendship event from synchronous code
# ---------------------------------------------------------------------------

def notify_friendship_event(user_ids: list[int], event_type: str, payload: dict):
    """
    Fire-and-forget channel layer notification from synchronous Django code
    (views, signals, Celery tasks, etc.).

    Example:
        notify_friendship_event(
            user_ids=[fr.sender_id, fr.receiver_id],
            event_type="friend_request.received",
            payload={"request": FriendRequestSerializer(fr).data},
        )
    """
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    channel_layer = get_channel_layer()
    if channel_layer is None:
        logger.warning("No channel layer configured; skipping WS notification.")
        return

    group_send = async_to_sync(channel_layer.group_send)
    for uid in user_ids:
        group_send(
            FriendshipConsumer._group_name(uid),
            {
                "type": "notify_friend_event",
                "event_type": event_type,
                "payload": payload,
            },
        )
