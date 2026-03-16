from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Message
from api.models import Friendship
from .serializers import MessageSerializer
from django.db import models


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        friend_username = self.request.query_params.get('friend', None)
        
        if friend_username:
            try:
                friend = User.objects.get(username=friend_username)
                
                # Check if they are friends
                is_friend = Friendship.objects.filter(
                    username=user,
                    friend=friend,
                    status='ACCEPTED'
                ).exists() or Friendship.objects.filter(
                    username=friend,
                    friend=user,
                    status='ACCEPTED'
                ).exists()
                
                if not is_friend:
                    return Message.objects.none()
                
                # Get messages between the two users
                return Message.objects.filter(
                    (
                        (models.Q(sender=user) & models.Q(receiver=friend)) |
                        (models.Q(sender=friend) & models.Q(receiver=user))
                    )
                ).order_by('timestamp')
                
            except User.DoesNotExist:
                return Message.objects.none()
        
        # If no friend specified, return all messages for this user
        return Message.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).order_by('timestamp')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, friend_id):
    try:
        friend = User.objects.get(id=friend_id)
        
        # Mark all messages from friend to user as read
        unread_messages = Message.objects.filter(
            sender=friend,
            receiver=request.user,
            is_read=False
        )
        
        count = unread_messages.count()
        unread_messages.update(is_read=True)
        
        return Response({'status': 'success', 'count': count})
    
    except User.DoesNotExist:
        return Response(
            {'status': 'error', 'message': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
