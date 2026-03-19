from django.contrib.auth import get_user_model
from django.db.models import Q
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
    """
    Write serializer for sending a new friend request.

    Accepts exactly ONE of: user_id (int), username (str), email (str).
    All string lookups are case-insensitive (iexact).
    """

    user_id = serializers.IntegerField(required=False)
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(required=False)

    # ------------------------------------------------------------------ #
    # Field-level: normalise email to lowercase so iexact hits the index  #
    # ------------------------------------------------------------------ #

    def validate_email(self, value: str) -> str:
        return value.lower()

    # ------------------------------------------------------------------ #
    # Cross-field validation                                               #
    # ------------------------------------------------------------------ #

    def validate(self, attrs: dict) -> dict:
        provided = {k: v for k, v in attrs.items() if v not in (None, "")}

        # ---- exactly one field ----------------------------------------
        if len(provided) == 0:
            raise serializers.ValidationError(
                "Provide exactly one of: user_id, username, or email."
            )
        if len(provided) > 1:
            raise serializers.ValidationError(
                "Provide exactly one lookup field per request. "
                f"You sent: {', '.join(provided.keys())}."
            )

        field, value = next(iter(provided.items()))
        request_user = self.context["request"].user

        # ---- resolve target user --------------------------------------
        target = self._resolve_user(field, value)

        # ---- self-send guard ------------------------------------------
        if target.pk == request_user.pk:
            raise serializers.ValidationError(
                "You cannot send a friend request to yourself."
            )

        # ---- existing request / friendship checks ---------------------
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
            # CANCELLED — allow re-sending (handled in the view)

        if Friendship.are_friends(request_user, target):
            raise serializers.ValidationError(
                "You are already friends with this user."
            )

        attrs["target"] = target
        return attrs

    # ------------------------------------------------------------------ #
    # Private helpers                                                      #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _resolve_user(field: str, value) -> User:
        """
        Resolve a single lookup field to a User instance.
        Raises ValidationError with a consistent "User not found." message
        regardless of field to avoid user-enumeration via distinct errors.
        """
        try:
            if field == "user_id":
                # Integer PK — no iexact needed, direct hit
                return User.objects.get(pk=value)
            if field == "username":
                return User.objects.get(username__iexact=value)
            if field == "email":
                return User.objects.get(email__iexact=value)
        except User.DoesNotExist:
            pass
        except User.MultipleObjectsReturned:
            # Theoretically impossible for PK/unique fields, but be safe
            raise serializers.ValidationError(
                "Multiple users matched that lookup. Please use user_id instead."
            )
        raise serializers.ValidationError("User not found.")


class FriendRequestActionSerializer(serializers.Serializer):
    """
    Used when the receiver responds to a pending request.
    action: accept | reject
    """

    ACTION_CHOICES = ["accept", "reject"]
    action = serializers.ChoiceField(choices=ACTION_CHOICES)


# ---------------------------------------------------------------------------
# Profile sub-serializers (sourced from api app models)
# ---------------------------------------------------------------------------

class TennisPlayerSummarySerializer(serializers.Serializer):
    """Minimal TennisPlayer representation for embedding in friend profiles."""

    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    avatar_url = serializers.CharField(read_only=True, allow_null=True)


class FriendProfileSerializer(serializers.Serializer):
    """
    Enriched user representation used inside FriendshipSerializer.
    Reads from the related user, userprofile and userproperties rows.
    Assumes select_related has already joined these tables.
    """

    id = serializers.IntegerField(source="pk", read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)

    # From UserProfile (OneToOne, related_name='userprofile')
    avatar_image = serializers.SerializerMethodField()

    # From UserProperties (OneToOne, related_name='userproperties')
    rankpoints = serializers.SerializerMethodField()
    current_player = serializers.SerializerMethodField()

    def get_avatar_image(self, user) -> str | None:
        try:
            return user.userprofile.avatar_image
        except AttributeError:
            return None

    def get_rankpoints(self, user) -> int | None:
        try:
            return user.userproperties.rankpoints
        except AttributeError:
            return None

    def get_current_player(self, user) -> dict | None:
        try:
            player = user.userproperties.current_player
        except AttributeError:
            return None
        if player is None:
            return None
        return TennisPlayerSummarySerializer(player).data


# ---------------------------------------------------------------------------
# Friendship
# ---------------------------------------------------------------------------

class FriendshipSerializer(serializers.ModelSerializer):
    """
    Read serializer for established friendships.

    The 'friend' field returns the OTHER participant enriched with profile
    data (avatar_image, rankpoints, current_player).
    The FriendListView must join the necessary related tables via
    select_related to avoid N+1 queries.
    """

    user1 = UserSummarySerializer(read_only=True)
    user2 = UserSummarySerializer(read_only=True)
    friend = serializers.SerializerMethodField(
        help_text="The other participant, enriched with profile data."
    )

    class Meta:
        model = Friendship
        fields = ["id", "user1", "user2", "friend", "created_at"]
        read_only_fields = fields

    def get_friend(self, obj) -> dict:
        request_user = self.context["request"].user
        other = obj.user2 if obj.user1_id == request_user.pk else obj.user1
        return FriendProfileSerializer(other, context=self.context).data
