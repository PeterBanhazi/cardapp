from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from game.routing import websocket_urlpatterns as game_websocket_urlpatterns

websocket_urlpatterns = chat_websocket_urlpatterns + game_websocket_urlpatterns
