import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from users.routing import websocket_urlpatterns as user_websocket_urlpatterns  # Rename to avoid conflict
from dm_chat.routing import websocket_urlpatterns as dm_chat_websocket_urlpatterns # Import dm_chat routes
from users.middleware import JWTAuthMiddleware  # Import middleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(  # Use custom JWT middleware
        AuthMiddlewareStack(
            URLRouter(user_websocket_urlpatterns + dm_chat_websocket_urlpatterns)
        )
    ),
})
