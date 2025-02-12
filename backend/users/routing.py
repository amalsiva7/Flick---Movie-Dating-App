print("Loading routing.py")

from django.urls import re_path
print("Imported re_path")

from .consumers import NotificationConsumer
print("Imported NotificationConsumer")

websocket_urlpatterns = [
    re_path(r"ws/notifications/(?P<user_id>\w+)/$", NotificationConsumer.as_asgi()),
]

print("Defined websocket_urlpatterns:", websocket_urlpatterns)



# Make sure these patterns are explicitly available for import
__all__ = ['websocket_urlpatterns']