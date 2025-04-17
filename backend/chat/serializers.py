from rest_framework import serializers
from .models import Message, UserStatus
from django.contrib.auth.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    receiver_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'receiver', 'receiver_username', 
                  'content', 'timestamp', 'is_read']
    
    def get_sender_username(self, obj):
        return obj.sender.username
    
    def get_receiver_username(self, obj):
        return obj.receiver.username

class UserStatusSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = UserStatus
        fields = ['username', 'is_online', 'last_activity']
    
    def get_username(self, obj):
        return obj.user.username
