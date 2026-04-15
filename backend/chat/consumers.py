#TODO: Heartbeat fronted implementation needed [ok]
#TODO: redis user presence feature [added], on system reconnect proper friend status update needed
#TODO: user persistence debounce needed for better frontend UX 
#TODO: check if it's valid friendship on each request

import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
User = get_user_model()
from .models import Message
from user_relations.models import Friendship  # Updated import path
from django.utils import timezone
from django.db import models
# from asgiref.sync import sync_to_async
from django.conf import settings
from .redis_presence import (
    async_add_connection,
    async_remove_connection,
    async_is_online,
    async_refresh_ttl,
)

from .redis_chat_state import (
    ACCEPTED, CANCELLED, CLOSED, PENDING, REJECTED,
    ChatStateError,
    async_get_pair_request,
    async_get_user_active_requests,
    async_transition,
)

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']       
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.username = self.user.username
        self.friend_username = self.scope['url_route']['kwargs']['username']
        
        #check if friend is online
        friend_id = await get_user_id(self.friend_username)        
        is_online = await async_is_online(friend_id) if friend_id else False
        if not is_online:
            await self.close()
            return
         
        # Check if they are friends
        is_friend = await self.check_friendship()       
        if not is_friend:
            await self.close()
            return
        
        # Create a unique room name for these two users (alphabetically sorted)
        users = sorted([self.username, self.friend_username])
        self.room_name = f"chat_{users[0]}_{users[1]}"
        self.room_group_name = f"chat_{self.room_name}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        ###
        # await self.send(text_data=json.dumps({
        #     'type': 'message',
        #     'message': 'Connected',
        #     'sender': {self.username},            
        # }))
        # Update user status
        
        
    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Update typing status to false when disconnecting
        if hasattr(self, 'room_group_name') and hasattr(self, 'username'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_status',
                    'user': self.username,
                    'is_typing': False
                }
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')
        
        if message_type == 'message':
            message = data['message']
            
            # Save message to database
            message_obj = await self.save_message(self.user, 
                                             await self.get_user_by_username(self.friend_username), 
                                             message)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': self.username,
                    'timestamp': message_obj.timestamp.isoformat()
                }
            )
        elif message_type == 'typing':
            is_typing = data['is_typing']
            
            # Send typing status to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_status',
                    'user': self.username,
                    'is_typing': is_typing
                }
            )
    
    async def chat_message(self, event):
        # Send message to WebSocket
        text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        })
        print(text_data)
        await self.send(text_data)
    
    async def typing_status(self, event):
        # Send typing status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def check_friendship(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            friend = User.objects.get(username=self.friend_username)
        except User.DoesNotExist:
            return False

        return Friendship.are_friends(self.user, friend)
    
    @database_sync_to_async
    def save_message(self, sender, receiver, content):
        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            content=content
        )
        return message
    
    @database_sync_to_async
    def get_user_by_username(self, username):
        return User.objects.get(username=username)
    


## ---------------------system
class SystemConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.user_id      = self.user.id
        self.username     = self.user.username
        self.socket_id    = str(uuid.uuid4())
        self.system_group = f"system_{self.username}"

        await self.channel_layer.group_add(self.system_group, self.channel_name)
        await self.accept()

        # ── Presence ─────────────────────────────────────────────────
        connection_count = await async_add_connection(self.user_id, self.socket_id)
        if connection_count == 1:          
            await self.broadcast_presence("online")

        # ── State sync: send THIS tab the full current picture ────────
        await self.sync_state_to_client()
    
    async def disconnect(self, close_code):
        if not hasattr(self, 'system_group'):
            return                


        # ── Redis: unregister this connection ────────────────────────────
        remaining = await async_remove_connection(self.user_id, self.socket_id)

        # Only broadcast "offline" when the LAST connection closes.
        # Closing one tab while others are open = still online.
        if remaining == 0:           
            await self.broadcast_presence("offline")

        await self.channel_layer.group_discard(self.system_group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        action = data.get("action")

        if action == "heartbeat":
            await async_refresh_ttl(self.user_id)
            return

        handler = getattr(self, f"handle_{action}", None)
        if handler:
            await handler(data)

    # ──────────────────────────────────────────────
    #  State sync  (called on every new connect)
    # ──────────────────────────────────────────────

    async def sync_state_to_client(self):
        """
        Push current truth to this tab only:
          1. Presence status of every accepted friend.
          2. Any active (pending / accepted) chat requests involving this user.
        """
        friends = await self.get_friends()
        print(self.username +":" + str(friends))
             
     
        # 1. Friend presence
        for friend in friends:
            # friend_id = await self.get_user_id(friend_username)
            is_online = await async_is_online(friend["user_id"]) if friend["user_id"] else False
            await self._send({
                "event": "presence_sync",
                "payload": {
                    "username": friend["username"],
                    "status":   "online" if is_online else "offline",
                },
            })

        # 2. Active chat requests (pending or accepted)
        active_reqs = await async_get_user_active_requests(self.username)
        for req in active_reqs:
            await self._send({
                "event":   "chat_request",
                "payload": req,
            })

    # ──────────────────────────────────────────────
    #  Chat-request action handlers
    # ──────────────────────────────────────────────

    async def handle_chat_request(self, data):
        """(no state | terminal state) ──► pending"""
        user_to = data.get("user_to")
        self.friend_username = user_to
        if not user_to:
            return

        # Check if they are friends and friend is online
        is_friend = await self.check_friendship()        
        friend_id = await get_user_id(self.friend_username)        
        is_online = await async_is_online(friend_id) if friend_id else False
      
        if not (is_friend and is_online):             
            return

        try:
            req = await async_transition(
                actor         = self.username,
                target_status = PENDING,
                user_from     = self.username,
                user_to       = user_to,
            )
        except ChatStateError as e:
            await self._send({"event": "chat_request_error", "payload": {"detail": str(e)}})
            return

        await self._broadcast_to_pair(req, "chat_request")

    async def handle_accept_chat(self, data):
        """pending ──► accepted  (only user_to)"""
        await self._drive_transition(data, ACCEPTED)

    async def handle_reject_chat(self, data):
        """pending ──► rejected  (only user_to)"""
        await self._drive_transition(data, REJECTED)

    async def handle_cancel_chat(self, data):
        """pending ──► cancelled  (only user_from)"""
        await self._drive_transition(data, CANCELLED)

    async def handle_close_chat(self, data):
        """accepted ──► closed  (either party)"""
        await self._drive_transition(data, CLOSED)

    # ──────────────────────────────────────────────
    #  Transition helper
    # ──────────────────────────────────────────────

    async def _drive_transition(self, data: dict, target_status: str):
        req_id = data.get("req_id")
        if not req_id:
            await self._send({
                "event":   "chat_request_error",
                "payload": {"detail": "req_id is required."},
            })
            return

        try:
            req = await async_transition(
                actor         = self.username,
                target_status = target_status,
                req_id        = req_id,
            )
        except ChatStateError as e:
            await self._send({"event": "chat_request_error", "payload": {"detail": str(e)}})
            return

        await self._broadcast_to_pair(req, "chat_request")

    # ──────────────────────────────────────────────
    #  Presence helpers
    # ──────────────────────────────────────────────

    async def broadcast_presence(self, status: str):
        friends = await self.get_friends()
        for friend in friends:
            await self.channel_layer.group_send(
                f"system_{friend["username"]}",
                {
                    "type":    "system_message",
                    "event":   "presence_update",
                    "payload": {
                        "username": self.username,
                        "presence":   status,
                    },
                },
            )

    # ──────────────────────────────────────────────
    #  Broadcast a request state to both participants
    # ──────────────────────────────────────────────

    async def _broadcast_to_pair(self, req: dict, event: str):
        for username in (req["user_from"], req["user_to"]):
            await self.channel_layer.group_send(
                f"system_{username}",
                {
                    "type":    "system_message",
                    "event":   event,
                    "payload": req,   # full req dict: req_id, status, timestamps, both users
                },
            )

    # ──────────────────────────────────────────────
    #  Channel-layer inbound handler
    # ──────────────────────────────────────────────

    async def system_message(self, event):
        await self._send({
            "event":   event["event"],
            "payload": event["payload"],
        })

    # ──────────────────────────────────────────────
    #  WebSocket send envelope
    # ──────────────────────────────────────────────

    async def _send(self, body: dict):
        await self.send(text_data=json.dumps({
            "type": "system_message",
            **body,
        }))

    # ──────────────────────────────────────────────
    #  DB helpers
    # ──────────────────────────────────────────────
    @database_sync_to_async
    def get_friends(self) -> list[dict]:
        user = self.user

        as_user1 = Friendship.objects.filter(user1=user).order_by().values(
            user_id=models.F("user2_id"),
            username=models.F("user2__username"),
        )
        as_user2 = Friendship.objects.filter(user2=user).order_by().values(
            user_id=models.F("user1_id"),
            username=models.F("user1__username"),
        )

        return list(as_user1.union(as_user2))   
    
    @database_sync_to_async
    def check_friendship(self):
        try:
            friend = User.objects.get(username=self.friend_username)
        except User.DoesNotExist:
            return False

        return Friendship.are_friends(self.user, friend)
    
# for batch id lookup
@database_sync_to_async
def get_friend_ids(usernames):
    return list(
        User.objects.filter(username__in=usernames)
        .values_list("id", flat=True)
    )

#for id + name lookup: {"id": 5, "username": "john"}
@database_sync_to_async
def get_friend(username: str) -> int | None:
    return User.objects.filter(username=username).values(
    "id", "username").first()
        
@database_sync_to_async
def get_user_id(username: str) -> int | None:
    try:
        return User.objects.values_list("id", flat=True).get(username=username)
    except User.DoesNotExist:
        return None
            
@database_sync_to_async
def get_friend_id(username):
    return User.objects.values_list("id", flat=True).get(username=username)


# deprecated:
    # @database_sync_to_async
    # def get_user_id(self, username: str) -> int | None:
    #     try:
    #         return User.objects.get(username=username).id
    #     except User.DoesNotExist:
    #         return None