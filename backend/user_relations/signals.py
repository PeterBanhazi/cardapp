"""
friendship/signals.py

Automatically fires WebSocket notifications whenever a FriendRequest or
Friendship row is saved/deleted. Wire up in FriendshipConfig.ready().
"""

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Friendship, FriendRequest


@receiver(post_save, sender=FriendRequest)
def on_friend_request_saved(sender, instance: FriendRequest, created: bool, **kwargs):
    from .consumers import notify_friendship_event
    from .serializers import FriendRequestSerializer

    # Lazy serialization without a request context (IDs will still be present)
    data = FriendRequestSerializer(instance).data
    print(data)
    status = instance.status

    if created or status == FriendRequest.Status.PENDING:
        # Notify the non-initiating participant
        recipient_id = (
            instance.receiver_id
            if instance.initiator_id == instance.sender_id
            else instance.sender_id
        )
        notify_friendship_event(
            user_ids=[recipient_id],
            event_type="friend_request.received",
            payload={"request": data},
        )

    elif status == FriendRequest.Status.ACCEPTED:
        notify_friendship_event(
            user_ids=[instance.sender_id, instance.receiver_id],
            event_type="friend_request.accepted",
            payload={"request": data},
        )

    elif status == FriendRequest.Status.REJECTED:
        # Only notify the initiator
        notify_friendship_event(
            user_ids=[instance.initiator_id],
            event_type="friend_request.rejected",
            payload={"request": data},
        )

    elif status == FriendRequest.Status.CANCELLED:
        other_id = (
            instance.receiver_id
            if instance.initiator_id == instance.sender_id
            else instance.sender_id
        )
        notify_friendship_event(
            user_ids=[other_id],
            event_type="friend_request.cancelled",
            payload={"request": data},
        )


@receiver(post_delete, sender=Friendship)
def on_friendship_deleted(sender, instance: Friendship, **kwargs):
    from .consumers import notify_friendship_event

    notify_friendship_event(
        user_ids=[instance.user1_id],
        event_type="friendship.removed",
        payload={"with_user_id": instance.user2_id},
    )
    notify_friendship_event(
        user_ids=[instance.user2_id],
        event_type="friendship.removed",
        payload={"with_user_id": instance.user1_id},
    )
