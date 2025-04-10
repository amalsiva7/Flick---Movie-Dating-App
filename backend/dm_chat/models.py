from django.db import models
from users.models import *

class Message(models.Model):
    sender = models.ForeignKey(Users, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(Users, related_name="received_messages", on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.content}"
