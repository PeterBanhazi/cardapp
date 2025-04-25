from django.db import models
from django.contrib.auth.models import User
from api.models import UserProperties
import random
import uuid

class Game(models.Model):
    GAME_STATUS_CHOICES = [
        ('WAITING', 'Waiting for players'),
        ('STARTING', 'Game is starting'),
        ('IN_PROGRESS', 'Game in progress'),
        ('COMPLETED', 'Game completed'),
        ('CANCELLED', 'Game cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player1 = models.ForeignKey(User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='games_as_player2', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=GAME_STATUS_CHOICES, default='WAITING')
    winner = models.ForeignKey(User, related_name='games_won', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    points_wagered = models.IntegerField(default=1)  # Default wager is 1 point
    
    def __str__(self):
        return f"Game {self.id}: {self.player1.username} vs {self.player2.username} - {self.status}"
    
    @property
    def room_group_name(self):
        return f"game_{self.id}"
    
    def determine_winner(self):
        """Randomly select a winner between player1 and player2"""
        if random.choice([True, False]):
            return self.player1
        else:
            return self.player2
            
    def update_user_points(self):
        """Update user points based on game result"""
        if not self.winner:
            return False
            
        loser = self.player2 if self.winner == self.player1 else self.player1
        
        # Update winner points
        winner_props, _ = UserProperties.objects.get_or_create(username=self.winner)
        winner_props.rankpoints += self.points_wagered
        winner_props.save()
        
        # Update loser points
        loser_props, _ = UserProperties.objects.get_or_create(username=loser)
        loser_props.rankpoints = max(0, loser_props.rankpoints - self.points_wagered)  # Ensure points don't go below 0
        loser_props.save()
        
        return True
        
class GameReadyStatus(models.Model):
    game = models.ForeignKey(Game, related_name='ready_statuses', on_delete=models.CASCADE)
    player = models.ForeignKey(User, related_name='game_ready_statuses', on_delete=models.CASCADE)
    is_ready = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('game', 'player')
