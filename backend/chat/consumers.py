import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message, UserStatus
from api.models import Friendship  # Updated import path
from django.utils import timezone
from asgiref.sync import sync_to_async
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.username = self.user.username
        self.friend_username = self.scope['url_route']['kwargs']['username']
        
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
        await self.send(text_data=f"Hello, {self.username}!")
        # Update user status
        await self.update_user_status(True)
        
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
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))
    
    async def typing_status(self, event):
        # Send typing status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def check_friendship(self):
        try:
            # Check if there's an accepted friendship in either direction
            friendship = Friendship.objects.filter(
                username__username=self.username,
                friend__username=self.friend_username,
                status='ACCEPTED'
            ).exists() or Friendship.objects.filter(
                username__username=self.friend_username,
                friend__username=self.username,
                status='ACCEPTED'
            ).exists()
            return friendship
        except Exception:
            return False
    
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
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        UserStatus.objects.update_or_create(
            user=self.user,
            defaults={'is_online': is_online, 'last_activity': timezone.now()}
        )


class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.username = self.user.username
        self.status_group_name = 'user_status'
        
        # Join status group
        await self.channel_layer.group_add(
            self.status_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Update user status
        await self.update_user_status(True)
        
        # Broadcast online status to all users
        await self.channel_layer.group_send(
            self.status_group_name,
            {
                'type': 'user_status',
                'user': self.username,
                'status': 'online'
            }
        )
        
        # Get friends online status
        friends = await self.get_friends()
        for friend in friends:
            status = await self.get_user_status(friend)
            await self.send(text_data=json.dumps({
                'type': 'status',
                'user': friend,
                'status': 'online' if status else 'offline'
            }))
    
    async def disconnect(self, close_code):
        if not hasattr(self, 'status_group_name'):
            return
            
        # Leave status group
        await self.channel_layer.group_discard(
            self.status_group_name,
            self.channel_name
        )
        
        # Update user status
        await self.update_user_status(False)
        
        # Broadcast offline status to all users
        await self.channel_layer.group_send(
            self.status_group_name,
            {
                'type': 'user_status',
                'user': self.username,
                'status': 'offline'
            }
        )
    
    async def receive(self, text_data):
        # Handle heartbeat or other status events
        data = json.loads(text_data)
        if data.get('type') == 'heartbeat':
            await self.update_user_status(True)
    
    async def user_status(self, event):
        # Send status update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'status',
            'user': event['user'],
            'status': event['status']
        }))
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        UserStatus.objects.update_or_create(
            user=self.user,
            defaults={'is_online': is_online, 'last_activity': timezone.now()}
        )
    
    @database_sync_to_async
    def get_friends(self):
        # Get all accepted friends
        friend_relations = Friendship.objects.filter(
            username=self.user,
            status='ACCEPTED'
        )
        return [relation.friend.username for relation in friend_relations]
    
    @database_sync_to_async
    def get_user_status(self, username):
        try:
            user = User.objects.get(username=username)
            status = UserStatus.objects.get(user=user)
            
            # Check if the user is considered online based on the timeout
            if status.is_online and (timezone.now() - status.last_activity).total_seconds() < settings.USER_ONLINE_TIMEOUT:
                return True
            return False
        except (User.DoesNotExist, UserStatus.DoesNotExist):
            return False