import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from users.models import Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'user_{self.user_id}'

        await self.channel_layer.group_add(self.group_name,self.channel_name)

        print("Going to accep tthe ws connect")

        await self.accept()

        print("Accepted ws connection")

        # Send all previous notifications
        await self.send_existing_notifications()
        print("send all the previous notifications")

        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name,self.channel_name)


    async def send_notification(self, event):
        message = event['message']
        
        print("call reached send notification in Consumers")

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': message
        }))
        print(message,"messag send from consumer")

    
    async def send_existing_notifications(self):
        notifications = await sync_to_async(list)(Notification.objects.filter(
            recipient_id = self.user_id).order_by('-created_at')[:10])
        
        notifications_data = [
            {
                "id": notification.id,
                "message": notification.message,
                "read": notification.is_read,
                "timestamp": notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            for notification in notifications
        ]

        await self.send(text_data = json.dumps({
            'type':'previous_notifications',
            'notifications' :notifications_data
        }))


class FlickConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'flick_{self.user_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        print("Accepting flick connection ")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print("Disconnect flick conncection")

    async def send_flick_message(self, event):
        flick_data = event['flick_data']

        await self.send(text_data=json.dumps({
            'type': 'flick_message',
            'flick_data': flick_data
        }))
        print(flick_data, "flick_data send from consumer")