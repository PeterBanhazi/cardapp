from celery import shared_task
from django.utils import timezone
from datetime import timedelta


# @shared_task
# def clean_old_messages(days=30):
#     """
#     Delete messages older than the specified number of days
#     """
#     from .models import Message
    
#     cutoff_date = timezone.now() - timedelta(days=days)
#     old_messages = Message.objects.filter(timestamp__lt=cutoff_date)
#     count = old_messages.count()
#     old_messages.delete()
    
#     return f"Deleted {count} old messages"