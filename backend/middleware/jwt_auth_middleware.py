# yourproject/middleware/jwt_auth_middleware.py

from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import jwt
from django.conf import settings


@database_sync_to_async
def get_user(user_id):
    try:
        return get_user_model().objects.get(id=user_id)
    except get_user_model().DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))

        # Token header usage:  b"authorization": b"Bearer <token>"
        raw_token = headers.get(b'authorization')
        if raw_token:
            try:
                prefix, token = raw_token.decode().split()
                if prefix.lower() == "bearer":
                    UntypedToken(token)  # check validity 

                    decoded_data = jwt.decode(
                        token,
                        settings.SECRET_KEY,
                        algorithms=["HS256"]
                    )

                    user_id = decoded_data.get("user_id")
                    scope["user"] = await get_user(user_id)
            except (ValueError, InvalidToken, TokenError, KeyError, jwt.DecodeError):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
