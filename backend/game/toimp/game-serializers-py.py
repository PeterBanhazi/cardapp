from rest_framework import serializers
from .models import Game, GameReadyStatus

class GameSerializer(serializers.ModelSerializer):
    player1_username = serializers.SerializerMethodField()
    player2_username = serializers.SerializerMethodField()
    winner_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = ['id', 'player1', 'player1_username', 'player2', 'player2_username', 
                 'status', 'winner', 'winner_username', 'created_at', 'updated_at', 'points_wagered']
        read_only_fields = ['id', 'player1', 'player2', 'status', 'winner', 'created_at', 'updated_at']
    
    def get_player1_username(self, obj):
        return obj.player1.username
    
    def get_player2_username(self, obj):
        return obj.player2.username
    
    def get_winner_username(self, obj):
        return obj.winner.username if obj.winner else None

class GameReadyStatusSerializer(serializers.ModelSerializer):
    player_username = serializers.SerializerMethodField()
    
    class Meta:
        model = GameReadyStatus
        fields = ['id', 'game', 'player', 'player_username', 'is_ready']
        read_only_fields = ['id', 'game', 'player']
    
    def get_player_username(self, obj):
        return obj.player.username
