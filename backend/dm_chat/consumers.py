import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Message
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sender_id = self.scope['user'].id
        self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']

        # Ensure consistent room naming (lower ID first)
        if int(self.sender_id) > int(self.receiver_id):
            self.room_group_name = f"chat_{self.receiver_id}_{self.sender_id}"
        else:
            self.room_group_name = f"chat_{self.sender_id}_{self.receiver_id}"


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"User {self.sender_id} connected to chat with {self.receiver_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"User {self.sender_id} disconnected from chat with {self.receiver_id}")


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_content = data['message']

            # Sanitize the message (example using a placeholder function)
            # message_content = sanitize_message(message_content)

            # Save message to database
            message = await sync_to_async(Message.objects.create)(
                sender_id=self.sender_id,
                receiver_id=self.receiver_id,
                content=message_content,
            )

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message.content,
                    'sender': self.scope['user'].username,  # Assuming username is in scope
                    'timestamp': str(message.timestamp),
                }
            )

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from user {self.sender_id}")
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.exception(f"Error processing message from user {self.sender_id}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to process message'
            }))


    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'sender': event['sender'],
                'timestamp': event['timestamp'],
            }))
        except Exception as e:
            logger.exception(f"Error sending message to user : {e}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to send message'
            }))


logger = logging.getLogger(__name__)

class ChatNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f"notification_{self.user_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"User {self.user_id} connected to notifications")


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"User {self.user_id} disconnected from notifications")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_notification',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_notification(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

