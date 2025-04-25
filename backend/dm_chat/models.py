#backend\dm_chat\models.py

from django.db import models
from users.models import *
from django.conf import settings


User = settings.AUTH_USER_MODEL

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    user1 = models.ForeignKey(User, related_name='chatroom_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chatroom_user2', on_delete=models.CASCADE)

    def __str__(self):
        return self.name



class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender_name')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receiver_name')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"