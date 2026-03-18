from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from api.models import TennisPlayer, UserProperties, UserProfile

User = get_user_model()


class FriendRequest(models.Model):
    """
    Represents a pending friendship request from one user to another.

    Deterministic ordering: sender_id is always the lower user PK,
    receiver_id is always the higher. This prevents duplicate requests
    in both directions and makes (sender, receiver) a natural unique key.
    Use FriendRequest.create() instead of FriendRequest.objects.create()
    to enforce the canonical ordering automatically.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    # Canonical ordering: sender_id < receiver_id always
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_requests",
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    # Who actually initiated the request (before canonical reorder)
    initiator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="initiated_requests",
        help_text="The user who actually clicked 'Send Request'.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Enforces one request per pair regardless of direction
        unique_together = [("sender", "receiver")]
        indexes = [
            # Fast lookup by either participant + status
            models.Index(fields=["sender", "status"]),
            models.Index(fields=["receiver", "status"]),
            # Covering index for "all requests involving user X"
            models.Index(fields=["sender", "receiver", "status"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"FriendRequest(initiator={self.initiator_id}, "
            f"pair=({self.sender_id}, {self.receiver_id}), "
            f"status={self.status})"
        )

    # ------------------------------------------------------------------
    # Factory — always call this instead of objects.create()
    # ------------------------------------------------------------------

    @classmethod
    def get_canonical_pair(cls, user_a: User, user_b: User):
        """Return (lower_pk_user, higher_pk_user) for deterministic storage."""
        if user_a.pk < user_b.pk:
            return user_a, user_b
        return user_b, user_a

    @classmethod
    def get_for_pair(cls, user_a: User, user_b: User):
        """Retrieve the request row for a pair, regardless of who sent it."""
        sender, receiver = cls.get_canonical_pair(user_a, user_b)
        try:
            return cls.objects.get(sender=sender, receiver=receiver)
        except cls.DoesNotExist:
            return None

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def clean(self):
        if self.sender_id == self.receiver_id:
            raise ValidationError("A user cannot send a friend request to themselves.")
        # Canonical ordering invariant
        if self.sender_id > self.receiver_id:
            raise ValidationError(
                "sender_id must be less than receiver_id. Use FriendRequest.create()."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Friendship(models.Model):
    """
    Represents an established (accepted) friendship between two users.

    Same deterministic ordering strategy as FriendRequest:
    user1_id is always the lower PK. This guarantees at most one row
    per pair and makes all pair-based lookups O(1) index hits.
    """

    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendships_as_user1",
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendships_as_user2",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user1", "user2")]
        indexes = [
            # Used by are_friends() and friends list queries
            models.Index(fields=["user1"]),
            models.Index(fields=["user2"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Friendship({self.user1_id} ↔ {self.user2_id})"

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @classmethod
    def get_canonical_pair(cls, user_a: User, user_b: User):
        if user_a.pk < user_b.pk:
            return user_a, user_b
        return user_b, user_a

    @classmethod
    def are_friends(cls, user_a: User, user_b: User) -> bool:
        user1, user2 = cls.get_canonical_pair(user_a, user_b)
        return cls.objects.filter(user1=user1, user2=user2).exists()

    @classmethod
    def get_friends(cls, user: User):
        """Return QuerySet of User objects who are friends with *user*."""
        friend_ids = set()
        friend_ids.update(
            cls.objects.filter(user1=user).values_list("user2_id", flat=True)
        )
        friend_ids.update(
            cls.objects.filter(user2=user).values_list("user1_id", flat=True)
        )
        return User.objects.filter(pk__in=friend_ids)

    def clean(self):
        if self.user1_id == self.user2_id:
            raise ValidationError("A user cannot be friends with themselves.")
        if self.user1_id > self.user2_id:
            raise ValidationError(
                "user1_id must be less than user2_id. Use Friendship.objects.create() "
                "via Friendship.get_canonical_pair()."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
