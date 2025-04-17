from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import UserStatus
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@shared_task
def check_user_status():
    """
    Check for users whose status should be changed to offline
    based on their last activity timestamp
    """
    channel_layer = get_channel_layer()
    
    # Find users who are marked as online but haven't been active
    timeout = timezone.now() - timedelta(seconds=settings.USER_ONLINE_TIMEOUT)
    inactive_users = UserStatus.objects.filter(
        is_online=True,
        last_activity__lt=timeout
    )
    
    # Update their status and broadcast the change
    for status in inactive_users:
        status.is_online = False
        status.save()
        
        # Broadcast status change to all users
        async_to_sync(channel_layer.group_send)(
            'user_status',
            {
                'type': 'user_status',
                'user': status.user.username,
                'status': 'offline'
            }
        )
    
    return f"Updated {inactive_users.count()} users to offline"


@shared_task
def clean_old_messages(days=30):
    """
    Delete messages older than the specified number of days
    """
    from .models import Message
    
    cutoff_date = timezone.now() - timedelta(days=days)
    old_messages = Message.objects.filter(timestamp__lt=cutoff_date)
    count = old_messages.count()
    old_messages.delete()
    
    return f"Deleted {count} old messages"