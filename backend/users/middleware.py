from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode("utf-8"))
        token = query_string.get("token", [None])[0]

        if token:
            user = await self.get_user_from_token(token)
            if user:
                scope['user'] = user
            else:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            User = get_user_model()
            return User.objects.get(id=user_id)

        except Exception as e:
            print(f"Token validation error: {e}")
            return None
