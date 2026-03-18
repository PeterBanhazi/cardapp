from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Friendship, FriendRequest

User = get_user_model()


# ---------------------------------------------------------------------------
# Minimal user representation (avoid exposing sensitive fields)
# ---------------------------------------------------------------------------

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# FriendRequest
# ---------------------------------------------------------------------------

class FriendRequestSerializer(serializers.ModelSerializer):
    """Read serializer — used in list / retrieve responses."""

    sender = UserSummarySerializer(read_only=True)
    receiver = UserSummarySerializer(read_only=True)
    initiator = UserSummarySerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = [
            "id",
            "sender",
            "receiver",
            "initiator",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class FriendRequestCreateSerializer(serializers.Serializer):
    """Write serializer for sending a new friend request."""

    to_user_id = serializers.IntegerField()

    def validate_to_user_id(self, value):
        request_user = self.context["request"].user

        # Cannot send to self
        if value == request_user.pk:
            raise serializers.ValidationError(
                "You cannot send a friend request to yourself."
            )

        # Target user must exist
        try:
            target = User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        # Check for an existing row (any status)
        existing = FriendRequest.get_for_pair(request_user, target)
        if existing:
            if existing.status == FriendRequest.Status.PENDING:
                raise serializers.ValidationError(
                    "A friend request between these users is already pending."
                )
            if existing.status == FriendRequest.Status.ACCEPTED:
                raise serializers.ValidationError(
                    "You are already friends with this user."
                )
            if existing.status == FriendRequest.Status.REJECTED:
                raise serializers.ValidationError(
                    "This friend request was previously rejected and cannot be resent."
                )
            # CANCELLED — allow re-sending (handled in view)

        # Also check they are not already friends (belt-and-suspenders)
        if Friendship.are_friends(request_user, target):
            raise serializers.ValidationError(
                "You are already friends with this user."
            )

        return value

    def validate(self, attrs):
        attrs["target"] = User.objects.get(pk=attrs["to_user_id"])
        return attrs


class FriendRequestActionSerializer(serializers.Serializer):
    """
    Used when the receiver responds to a pending request.
    action: accept | reject
    """

    ACTION_CHOICES = ["accept", "reject"]
    action = serializers.ChoiceField(choices=ACTION_CHOICES)


# ---------------------------------------------------------------------------
# Friendship
# ---------------------------------------------------------------------------

class FriendshipSerializer(serializers.ModelSerializer):
    """Read serializer for established friendships."""

    user1 = UserSummarySerializer(read_only=True)
    user2 = UserSummarySerializer(read_only=True)
    friend = serializers.SerializerMethodField(
        help_text="The other participant from the requesting user's perspective."
    )

    class Meta:
        model = Friendship
        fields = ["id", "user1", "user2", "friend", "created_at"]
        read_only_fields = fields

    def get_friend(self, obj):
        request_user = self.context["request"].user
        other = obj.user2 if obj.user1_id == request_user.pk else obj.user1
        return UserSummarySerializer(other, context=self.context).data
