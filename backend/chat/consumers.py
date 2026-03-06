#TODO: Heartbeat fronted implementation needed 
#TODO: redis user presence feature
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message, UserStatus
from api.models import Friendship  # Updated import path
from django.utils import timezone
# from asgiref.sync import sync_to_async
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
        
        ###
        # await self.send(text_data=json.dumps({
        #     'type': 'message',
        #     'message': 'Connected',
        #     'sender': {self.username},            
        # }))
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

## ---------------------system
class SystemConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        print(self.user)        
        self.system_group_name = f"system_{self.user}"
        
        # Join group for system messages 
        await self.channel_layer.group_add(
            self.system_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Update user status
        await self.update_user_status(True)
        
        print("connect ok!")
        print(self.system_group_name)
        
        # Broadcast online status to frontend via WS0
        await self.channel_layer.group_send(
            self.system_group_name,
            {
                'type': 'system_message',
                'event': 'logged in',
                'user_to': 'system',
                'user_from': self.user.username,
                'status': 'online'
            }
        )
        
        # Get friends online status and send actual state of friends who has 'accepted' relation
        # and broadcast to client via WS to initialise online user array at frontend
        friends = await self.get_friends()
        for friend in friends:
            status = await self.get_user_status(friend)
            await self.send(text_data=json.dumps({
                'type': 'system_message',                
                'user_from': friend,
                'user_to': self.user.username,
                'event': 'system login event',
                'status': 'online' if status else 'offline'
            }))
    
        
        # Broadcast online status to all friend's system cannel who has accepted relation        
        for friend in friends:                    
            await self.channel_layer.group_send(
            f"system_{friend}",{                
                'type': 'system_message',
                'user_to': friend,
                'user_from': self.user.username,
                'event': 'system log_in event',
                'status': 'online'
                }
            )
    
    async def disconnect(self, close_code):
        if not hasattr(self, 'system_group_name'):
            return                

        # Broadcast offline status to all users
        friends = await self.get_friends()
        for friend in friends:                     
            await self.channel_layer.group_send(
            f"system_{friend}",{                
                'type': 'system_message',
                'user_to': friend,
                'user_from': self.user.username,
                'event': 'system log_out event',
                'status': 'offline'
                }
            )
        
        # Update user status
        await self.update_user_status(False)
        
        # Leave status group
        await self.channel_layer.group_discard(
            self.system_group_name,
            self.channel_name
        )    
  
    async def receive(self, text_data):
        # Handle heartbeat or other status events
        
        data = json.loads(text_data)
        
        self.user = self.scope['user']        
    
       
        
        
        action = data.get("action")

        handler = getattr(self, f"handle_{action}", None)

        if handler:
            await handler(data)

        
        # self.userto = data.get('user')
        # self.system_group_name = f"system_{self.userto}"
        # print("incoming sysreq")
        # print(self.userto)
        # print(self.system_group_name)
        
        
        # if data.get('type') == 'system_message' and data.get('event') == 'chat_request':           
        #     await self.channel_layer.group_send(                        
        #     self.system_group_name,
        #     {
        #         'type': 'system_message',
        #         'user_from': data.get('user'),
        #         'sender': data.get('sender'),
        #         'event': data.get('event'),
        #         'status': data.get('status'),
        #     }
        #     )
        #     print("request arrived")
        

        # send message to self system message channel on accepted     
        
        # if data.get('type') == 'system_message' and data.get('status') == 'accepted': 
        #     system_self_group_name = f"system_{self.user}"        
        #     await self.channel_layer.group_send(                        
        #     system_self_group_name,
        #     {
        #         'type': 'system_message',
        #         'user': data.get('sender'),
        #         'sender': self.userto,
        #         'event': data.get('event'),
        #         'status': data.get('status'),
        #     }
        #     )
            
        # Frontend implementation needed  
        # if data.get('type') == 'heartbeat':
        #     await self.update_user_status(True)

    async def handle_chat_request(self, data):
        print("test: "+self.user.username)
        friend = data["user_to"]

        await self.channel_layer.group_send(
            f"system_{friend}",
            {
                "type": "system_message",
                "event": "chat_request_received",
                "user_from": self.user.username,
                "user_to": friend,
                "status": "pending"
            }
        )

        await self.channel_layer.group_send(
            f"system_{self.user}",
            {
                "type": "system_message",
                "event": "chat_request_sent",
                "user_from": self.user.username,
                "user_to": friend,
                "status": "pending"
            }
        )

    
    async def handle_accept_chat(self, data):

        friend = data["user_from"]

        await self.channel_layer.group_send(
            f"system_{friend}",
            {
                "type": "system_message",
                "event": "chat_request_accepted",
                "user_from": friend,
                "user_to": self.user.username,
                "status": "active"
            }
        )

        await self.channel_layer.group_send(
            f"system_{self.user}",
            {
                "type": "system_message",
                "event": "chat_request_accepted",
                "user_from": friend,
                "user_to": self.user.username,
                "status": "active"
            }
        )
    
    async def handle_reject_chat(self, data):

        friend = data["user_from"]

        await self.channel_layer.group_send(
            f"system_{friend}",
            {
                "type": "system_message",
                "event": "chat_request_rejected",
                "user_from": friend,
                "user_to": self.user.username,
                "status": "rejected"
            }
        )
        
        await self.channel_layer.group_send(
            f"system_{self.user}",
            {
                "type": "system_message",
                "event": "chat_request_rejected",
                "user_from": friend,
                "user_to": self.user.username,
                "status": "rejected"
            }
        )
        
    async def handle_cancel_chat(self, data):

        friend = data["user_to"]

        await self.channel_layer.group_send(
            f"system_{friend}",
            {
                "type": "system_message",
                "event": "chat_request_cancelled",
                "user_from": self.user.username,
                "user_to": friend,
                "status": "cancelled"
            }
        )
    
    async def handle_close_chat(self, data):

        friend = data["user_from"]

        await self.channel_layer.group_send(
            f"system_{friend}",
            {
                "type": "system_message",
                "event": "chat_closed",
                "user_from": data["user_from"],
                "user_to": friend,
                "status": "closed"
            }
        )

        await self.channel_layer.group_send(
            f"system_{self.user}",
            {
                "type": "system_message",
                "event": "chat_closed",
                "user_from": data["user_from"],
                "user_to": self.user.username,
                "status": "closed"
            }
        )
        
    async def system_message(self, event):
        text_data=json.dumps({            
            "type": "system_message",
            "event": event["event"],
            "user_from": event["user_from"],
            "user_to": event["user_to"],
            "status": event["status"]
        })
        print(text_data)

        await self.send(text_data)
    
    # async def system_message(self, event):
    #     # Send status update to WebSocket
    #     self.user = self.scope['user']
    #     await self.send(text_data=json.dumps({
    #         'type': 'system_message',
    #         'user': self.user.username,
    #         'sender': event['sender'],
    #         'event': event['event'],
    #         'status': event['status']
    #     }))
    
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
        print([relation.friend.username for relation in friend_relations])
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

