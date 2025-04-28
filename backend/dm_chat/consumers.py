import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatMessage,ChatRoom
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        if not user or user.is_anonymous or str(user.id) != self.user_id:
            await self.close()
            return

        user1_id, user2_id = self.room_name.replace('chat_', '').split('_')
        if str(user.id) not in {user1_id, user2_id}:
            await self.close()
            return

        self.sender_id = str(user.id)
        self.receiver_id = user2_id if self.sender_id == user1_id else user1_id
        self.room_group_name = f"chat_{self.room_name}"

        self.chat_room = await sync_to_async(ChatRoom.objects.get)(name=self.room_name)

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
            message = await sync_to_async(ChatMessage.objects.create)(

                sender_id=self.sender_id,
                receiver_id=self.receiver_id,
                content=message_content,
                room=self.chat_room,
            )

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message.content,
                    'sender': self.scope['user'].id,
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
        user = self.scope.get('user')
        self.user_id = self.scope['url_route']['kwargs']['user_id']

        if not user or user.is_anonymous or str(user.id) != self.user_id:
            await self.close()
            return


        self.room_group_name = f"chat_notification_{self.user_id}"

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

