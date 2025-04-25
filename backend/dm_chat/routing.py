from django.urls import re_path
from .consumers import *

# backend/dm_chat/routing.py
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/chat_notifications/(?P<user_id>\w+)/$', ChatNotificationConsumer.as_asgi()),
]
