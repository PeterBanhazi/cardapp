###/// wrapper for certain middlewares

from middleware.jwt_auth_middleware import JWTAuthMiddleware
from channels.middleware import BaseMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
