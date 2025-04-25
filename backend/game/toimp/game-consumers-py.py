import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Game, GameReadyStatus
from api.models import Friendship

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_room_name = f"game_{self.game_id}"
        
        # Check if user is part of this game
        game = await self.get_game()
        if not game or (self.user != game.player1 and self.user != game.player2):
            await self.close()
            return
            
        # Join game room
        await self.channel_layer.group_add(
            self.game_room_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send current game state to the connected user
        game_state = await self.get_game_state()
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': game_state
        }))
        
    async def disconnect(self, close_code):
        # Leave game room
        if hasattr(self, 'game_room_name'):
            await self.channel_layer.group_discard(
                self.game_room_name,
                self.channel_name
            )
            
        # If game is in waiting or starting state, cancel it
        game = await self.get_game()
        if game and game.status in ['WAITING', 'STARTING']:
            await self.cancel_game(game)
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        action_type = data.get('type', '')
        
        if action_type == 'ready':
            # Player is ready to start
            is_ready = data.get('ready', False)
            await self.set_player_ready(is_ready)
            
            # Check if both players are ready
            both_ready = await self.check_both_players_ready()
            if both_ready:
                # Start the game countdown
                await self.start_game_countdown()
                
    async def game_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
    
    async def countdown_message(self, event):
        # Send countdown message to WebSocket
        await self.send(text_data=json.dumps(event))
    
    async def game_result(self, event):
        # Send game result to WebSocket
        await self.send(text_data=json.dumps(event))
        
    async def game_state(self, event):
        # Send game state to WebSocket
        await self.send(text_data=json.dumps(event))
    
    @database_sync_to_async
    def get_game(self):
        try:
            return Game.objects.get(id=self.game_id)
        except Game.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_game_state(self):
        game = Game.objects.get(id=self.game_id)
        player1_ready = GameReadyStatus.objects.filter(game=game, player=game.player1, is_ready=True).exists()
        player2_ready = GameReadyStatus.objects.filter(game=game, player=game.player2, is_ready=True).exists()
        
        return {
            'status': game.status,
            'player1': game.player1.username,
            'player2': game.player2.username,
            'player1_ready': player1_ready,
            'player2_ready': player2_ready,
            'points_wagered': game.points_wagered,
            'winner': game.winner.username if game.winner else None,
        }
    
    @database_sync_to_async
    def set_player_ready(self, is_ready):
        game = Game.objects.get(id=self.game_id)
        GameReadyStatus.objects.update_or_create(
            game=game,
            player=self.user,
            defaults={'is_ready': is_ready}
        )
    
    @database_sync_to_async
    def check_both_players_ready(self):
        game = Game.objects.get(id=self.game_id)
        player1_ready = GameReadyStatus.objects.filter(game=game, player=game.player1, is_ready=True).exists()
        player2_ready = GameReadyStatus.objects.filter(game=game, player=game.player2, is_ready=True).exists()
        
        if player1_ready and player2_ready:
            game.status = 'STARTING'
            game.save()
            return True
        return False
    
    @database_sync_to_async
    def cancel_game(self, game):
        game.status = 'CANCELLED'
        game.save()
        
        # Notify players about cancellation
        return game
    
    async def start_game_countdown(self):
        """Start the countdown and then determine the winner"""
        # Send game starting message
        await self.channel_layer.group_send(
            self.game_room_name,
            {
                'type': 'game_message',
                'message': 'Game is starting!',
                'game_status': 'STARTING'
            }
        )
        
        # Update game status to 'IN_PROGRESS'
        game = await self.get_game()
        game = await self.update_game_status('IN_PROGRESS')
        
        # Countdown from 3
        for i in range(3, 0, -1):
            await self.channel_layer.group_send(
                self.game_room_name,
                {
                    'type': 'countdown_message',
                    'count': i
                }
            )
            await asyncio.sleep(1)
        
        # Determine winner
        game, winner_username = await self.determine_winner()
        
        # Send game result
        await self.channel_layer.group_send(
            self.game_room_name,
            {
                'type': 'game_result',
                'winner': winner_username,
                'game_status': 'COMPLETED'
            }
        )
        
        # Update game state for both players
        game_state = await self.get_game_state()
        await self.channel_layer.group_send(
            self.game_room_name,
            {
                'type': 'game_state',
                'state': game_state
            }
        )
    
    @database_sync_to_async
    def update_game_status(self, status):
        game = Game.objects.get(id=self.game_id)
        game.status = status
        game.save()
        return game
    
    @database_sync_to_async
    def determine_winner(self):
        game = Game.objects.get(id=self.game_id)
        
        # Get winner (random choice between player1 and player2)
        winner = game.determine_winner()
        
        # Update game with winner
        game.winner = winner
        game.status = 'COMPLETED'
        game.save()
        
        # Update user points
        game.update_user_points()
        
        return game, winner.username


class GameMatchmakingConsumer(AsyncWebsocketConsumer):
    """Consumer for finding and creating games with friends"""
    
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.room_name = f"matchmaking_{self.user.username}"
        
        # Join personal matchmaking room
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave matchmaking room
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', '')
        
        if action == 'invite_friend':
            friend_username = data.get('friend_username')
            
            # Check if they are friends
            is_friend = await self.check_friendship(friend_username)
            if not is_friend:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'You are not friends with this user'
                }))
                return
                
            # Create a new game
            game = await self.create_game(friend_username)
            
            # Send invitation to friend
            await self.channel_layer.group_send(
                f"matchmaking_{friend_username}",
                {
                    'type': 'game_invitation',
                    'from': self.user.username,
                    'game_id': str(game.id)
                }
            )
            
            # Send confirmation to the inviting user
            await self.send(text_data=json.dumps({
                'type': 'invitation_sent',
                'to': friend_username,
                'game_id': str(game.id)
            }))
        
        elif action == 'accept_invitation':
            game_id = data.get('game_id')
            
            # Find and validate game
            game = await self.get_game_by_id(game_id)
            if not game:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Game not found'
                }))
                return
                
            if game.status != 'WAITING':
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Game is no longer available'
                }))
                return
                
            if self.user != game.player1 and self.user != game.player2:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'You are not part of this game'
                }))
                return
                
            # Send game accepted notification to both players
            for player in [game.player1.username, game.player2.username]:
                await self.channel_layer.group_send(
                    f"matchmaking_{player}",
                    {
                        'type': 'game_ready',
                        'game_id': str(game.id)
                    }
                )
    
    async def game_invitation(self, event):
        # Send invitation to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_invitation',
            'from': event['from'],
            'game_id': event['game_id']
        }))
    
    async def game_ready(self, event):
        # Send game ready notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_ready',
            'game_id': event['game_id']
        }))
    
    @database_sync_to_async
    def check_friendship(self, friend_username):
        try:
            # Check if there's an accepted friendship in either direction
            friendship = Friendship.objects.filter(
                username__username=self.user.username,
                friend__username=friend_username,
                status='ACCEPTED'
            ).exists() or Friendship.objects.filter(
                username__username=friend_username,
                friend__username=self.user.username,
                status='ACCEPTED'
            ).exists()
            return friendship
        except Exception:
            return False
    
    @database_sync_to_async
    def create_game(self, friend_username):
        friend = User.objects.get(username=friend_username)
        
        game = Game.objects.create(
            player1=self.user,
            player2=friend,
            status='WAITING',
            points_wagered=1  # Default wager
        )
        
        return game
    
    @database_sync_to_async
    def get_game_by_id(self, game_id):
        try:
            return Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return None
