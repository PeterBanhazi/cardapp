from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Friendship, FriendRequest
from .serializers import (
    FriendRequestActionSerializer,
    FriendRequestCreateSerializer,
    FriendRequestSerializer,
    FriendshipSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_pending_request_or_404(pk: int, user) -> FriendRequest:
    """
    Return the FriendRequest only if it exists and the user is involved.
    Raises NotFound or PermissionDenied as appropriate.
    """
    try:
        fr = FriendRequest.objects.select_related("sender", "receiver", "initiator").get(pk=pk)
    except FriendRequest.DoesNotExist:
        raise NotFound("Friend request not found.")

    involved = fr.sender_id == user.pk or fr.receiver_id == user.pk
    if not involved:
        raise PermissionDenied("You do not have permission to access this request.")
    return fr


# ---------------------------------------------------------------------------
# Friend Request — Send
# ---------------------------------------------------------------------------

class FriendRequestCreateView(APIView):
    """
    POST /api/friends/requests/
    Send a new friend request to another user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FriendRequestCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        target: User = serializer.validated_data["target"]
        requester: User = request.user

        sender, receiver = FriendRequest.get_canonical_pair(requester, target)

        with transaction.atomic():
            existing = FriendRequest.get_for_pair(requester, target)

            if existing and existing.status == FriendRequest.Status.CANCELLED:
                # Allow re-sending a previously cancelled request
                existing.status = FriendRequest.Status.PENDING
                existing.initiator = requester
                existing.save(update_fields=["status", "initiator", "updated_at"])
                fr = existing
            else:
                fr = FriendRequest.objects.create(
                    sender=sender,
                    receiver=receiver,
                    initiator=requester,
                )

        return Response(
            FriendRequestSerializer(fr, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Friend Request — List (inbox + outbox)
# ---------------------------------------------------------------------------

class FriendRequestListView(generics.ListAPIView):
    """
    GET /api/friends/requests/?direction=received|sent
    List pending friend requests for the authenticated user.
    `direction` defaults to 'received'.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendRequestSerializer

    def get_queryset(self):
        user = self.request.user
        direction = self.request.query_params.get("direction", "received")
        qs = FriendRequest.objects.select_related(
            "sender", "receiver", "initiator"
        ).filter(status=FriendRequest.Status.PENDING)

        if direction == "sent":
            return qs.filter(initiator=user)
        # default: received means the other person initiated
        return qs.exclude(initiator=user).filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )


# ---------------------------------------------------------------------------
# Friend Request — Retrieve / Cancel
# ---------------------------------------------------------------------------

class FriendRequestDetailView(APIView):
    """
    GET  /api/friends/requests/<pk>/   — retrieve a request you are part of
    DELETE /api/friends/requests/<pk>/ — cancel a request YOU initiated
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        fr = _get_pending_request_or_404(pk, request.user)
        return Response(
            FriendRequestSerializer(fr, context={"request": request}).data
        )

    def delete(self, request, pk):
        fr = _get_pending_request_or_404(pk, request.user)

        if fr.initiator_id != request.user.pk:
            raise PermissionDenied("Only the initiator can cancel a friend request.")

        if fr.status != FriendRequest.Status.PENDING:
            raise ValidationError(
                f"Cannot cancel a request with status '{fr.status}'."
            )

        fr.status = FriendRequest.Status.CANCELLED
        fr.save(update_fields=["status", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Friend Request — Accept / Reject
# ---------------------------------------------------------------------------

class FriendRequestActionView(APIView):
    """
    POST /api/friends/requests/<pk>/action/
    Body: { "action": "accept" | "reject" }

    Only the non-initiating participant (i.e. the person who received the
    request) may accept or reject it.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        fr = _get_pending_request_or_404(pk, request.user)

        # Must be the receiver (non-initiator)
        if fr.initiator_id == request.user.pk:
            raise PermissionDenied(
                "You cannot accept or reject your own friend request."
            )

        if fr.status != FriendRequest.Status.PENDING:
            raise ValidationError(
                f"This request cannot be acted on (status: '{fr.status}')."
            )

        serializer = FriendRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]

        with transaction.atomic():
            if action == "accept":
                fr.status = FriendRequest.Status.ACCEPTED
                fr.save(update_fields=["status", "updated_at"])

                user1, user2 = Friendship.get_canonical_pair(
                    fr.sender, fr.receiver
                )
                Friendship.objects.get_or_create(user1=user1, user2=user2)

            else:  # reject
                fr.status = FriendRequest.Status.REJECTED
                fr.save(update_fields=["status", "updated_at"])

        return Response(
            FriendRequestSerializer(fr, context={"request": request}).data
        )


# ---------------------------------------------------------------------------
# Friendship — List
# ---------------------------------------------------------------------------

class FriendListView(generics.ListAPIView):
    """
    GET /api/friends/
    List all confirmed friends of the authenticated user.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendshipSerializer

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return (
            Friendship.objects.select_related("user1", "user2")
            .filter(Q(user1=user) | Q(user2=user))
        )


# ---------------------------------------------------------------------------
# Friendship — Remove (unfriend)
# ---------------------------------------------------------------------------

class FriendRemoveView(APIView):
    """
    DELETE /api/friends/<user_id>/
    Remove a friendship with the specified user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        try:
            other = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise NotFound("User not found.")

        user1, user2 = Friendship.get_canonical_pair(request.user, other)
        deleted_count, _ = Friendship.objects.filter(
            user1=user1, user2=user2
        ).delete()

        if deleted_count == 0:
            raise NotFound("You are not friends with this user.")

        return Response(status=status.HTTP_204_NO_CONTENT)


# Need this import for FriendRequestListView
from django.db import models  # noqa: E402 (placed after class defs intentionally)
