from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<receiver_id>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/chat_notifications/(?P<user_id>\w+)/$', ChatNotificationConsumer.as_asgi()),
]