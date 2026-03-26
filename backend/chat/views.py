from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Message
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from user_relations.models import Friendship
from .serializers import MessageSerializer
from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        friend_username = self.request.query_params.get('friend')

        if friend_username:
            try:
                friend = User.objects.get(username=friend_username)
            except User.DoesNotExist:
                return Message.objects.none()

            # use helper
            if not Friendship.are_friends(user, friend):
                return Message.objects.none()

            return Message.objects.filter(
                Q(sender=user, receiver=friend) |
                Q(sender=friend, receiver=user)
            ).order_by('timestamp')
        
        # If no friend specified, return all messages for this user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
            ).order_by('timestamp') 
        



        
    def perform_create(self, serializer):
        receiver = serializer.validated_data['receiver']
        user = self.request.user

        if not Friendship.are_friends(user, receiver):
            raise PermissionDenied("Not friends")

        serializer.save(sender=user)
    


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
