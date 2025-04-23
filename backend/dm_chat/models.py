#backend\dm_chat\models.py

from django.db import models
from users.models import *
from django.conf import settings

class ChatRoomModel(models.Model):
    name = models.CharField(max_length=255, unique=True)
    user1 = models.IntegerField(blank=True, null=True)
    user2 = models.IntegerField(blank=True, null=True)
    user1_name = models.CharField(max_length=50, blank=True, null=True)
    user2_name = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name




class Message(models.Model):
    room = models.ForeignKey(ChatRoomModel, on_delete=models.CASCADE, related_name='messages')
    user_id = models.IntegerField(blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"