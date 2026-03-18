"""
friendship/routing.py

Add to your project's main ASGI routing:

    from channels.auth import AuthMiddlewareStack
    from channels.routing import ProtocolTypeRouter, URLRouter
    from friendship.routing import websocket_urlpatterns

    application = ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    })
"""

from django.urls import re_path

from .consumers import FriendshipConsumer

websocket_urlpatterns = [
    re_path(r"^ws/friends/$", FriendshipConsumer.as_asgi()),
]
