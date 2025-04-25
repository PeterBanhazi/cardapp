from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Game, GameReadyStatus
from api.models import Friendship, UserProperties
from .serializers import GameSerializer, GameReadyStatusSerializer

class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(
            models.Q(player1=user) | models.Q(player2=user)
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        # Ensure friend_username is a valid friend
        friend_username = self.request.data.get('friend_username')
        
        try:
            friend = User.objects.get(username=friend_username)
            
            # Check if they are friends
            is_friend = Friendship.objects.filter(
                username=self.request.user,
                friend=friend,
                status='ACCEPTED'
            ).exists() or Friendship.objects.filter(
                username=friend,
                friend=self.request.user,
                status='ACCEPTED'
            ).exists()
            
            if not is_friend:
                raise serializers.ValidationError("You are not friends with this user")
                
            serializer.save(player1=self.request.user, player2=friend)
            
        except User.DoesNotExist:
            raise serializers.ValidationError("Friend not found")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    user = request.user
    
    try:
        user_props = UserProperties.objects.get(username=user)
    except UserProperties.DoesNotExist:
        user_props = UserProperties.objects.create(username=user)
        
    # Get game stats
    games_played = Game.objects.filter(
        models.Q(player1=user) | models.Q(player2=user),
        status='COMPLETED'
    ).count()
    
    games_won = Game.objects.filter(
        winner=user,
        status='COMPLETED'
    ).count()
    
    return Response({
        'username': user.username,
        'rank_points': user_props.rankpoints,
        'games_played': games_played,
        'games_won': games_won,
        'win_rate': (games_won / games_played * 100) if games_played > 0 else 0
    })
