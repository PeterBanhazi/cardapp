"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
# Initialize Django first, then the rest:
django_asgi_app = get_asgi_application()


from channels.routing import ProtocolTypeRouter, URLRouter
from middleware.middleware_stack import JWTAuthMiddlewareStack
from chat.routing import websocket_urlpatterns as chat_ws
from user_relations.routing import websocket_urlpatterns as user_relations_ws 

# This code snippet is configuring the ASGI (Asynchronous Server Gateway Interface) application for
# the Django project. Here's a breakdown of what it's doing:
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            user_relations_ws + chat_ws
        )
    ),
})