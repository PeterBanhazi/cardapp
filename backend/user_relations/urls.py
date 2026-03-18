"""
friendship/urls.py

Include in your project's urls.py:

    path("api/friends/", include("friendship.urls")),

And in your ASGI routing (routing.py):

    from channels.routing import ProtocolTypeRouter, URLRouter
    from friendship.routing import websocket_urlpatterns

    application = ProtocolTypeRouter({
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    })
"""

from django.urls import path

from .views import (
    FriendListView,
    FriendRemoveView,
    FriendRequestActionView,
    FriendRequestCreateView,
    FriendRequestDetailView,
    FriendRequestListView,
)

urlpatterns = [
    # Friendships
    path("", FriendListView.as_view(), name="friend-list"),
    path("<int:user_id>/", FriendRemoveView.as_view(), name="friend-remove"),

    # Friend Requests
    path("requests/", FriendRequestCreateView.as_view(), name="friend-request-create"),
    path("requests/list/", FriendRequestListView.as_view(), name="friend-request-list"),
    path("requests/<int:pk>/", FriendRequestDetailView.as_view(), name="friend-request-detail"),
    path("requests/<int:pk>/action/", FriendRequestActionView.as_view(), name="friend-request-action"),
]
