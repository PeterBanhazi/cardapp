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
    FriendRequestDetailView,
    FriendRequestListCreateView,
)

urlpatterns = [
    # Friendships
    path("", FriendListView.as_view(), name="friend-list"),
    path("<int:user_id>/", FriendRemoveView.as_view(), name="friend-remove"),

    # Friend Requests  —  GET=list, POST=create, both at the same URL
    path("requests/", FriendRequestListCreateView.as_view(), name="friend-requests"),
    path("requests/<int:pk>/", FriendRequestDetailView.as_view(), name="friend-request-detail"),
    path("requests/<int:pk>/action/", FriendRequestActionView.as_view(), name="friend-request-action"),
]
