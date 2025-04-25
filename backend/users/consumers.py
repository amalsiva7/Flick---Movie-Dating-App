import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from users.models import Notification,FlickAnswer, FlickQuestion
from users.models import Match
from users.models import UserImage
from django.utils.timezone import localtime
from django.db.models import Q




class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if user is None or user.is_anonymous:
            await self.close()
            return

        self.user_id = self.scope['url_route']['kwargs']['user_id']

        if str(user.id) != self.user_id:
            await self.close()
            return

        self.group_name = f'user_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()

        await self.send_existing_notifications()

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        message = event['message']

        print('***************************inside the send_notification in NotificationConsumer************************',message)

        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': message
        }))

    async def send_existing_notifications(self):
        notifications = await sync_to_async(list)(
            Notification.objects.filter(recipient_id=self.user_id).order_by('-created_at')[:10]
        )
        
        notifications_data = [
            {
                "id": notification.id,
                "message": notification.message,
                "read": notification.is_read,
                "timestamp": notification.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "type": notification.notification_type,
            }
            for notification in notifications
        ]

        await self.send(text_data=json.dumps({
            'type': 'previous_notifications',
            'notifications': notifications_data
        }))




class AnswerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        self.user_id = self.scope['url_route']['kwargs']['user_id']

        if not user or user.is_anonymous or str(user.id) != self.user_id:
            await self.close()
            return

        self.group_name = f'answers_{self.user_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        await self.send_existing_answers()

    async def disconnect(self, close_code):
        # Check if group_name exists before attempting removal
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_answer(self, event):

        print('***************************inside the send_answer in AnswerConsumer************************',event['answer_data'])
    

        await self.send(text_data=json.dumps({
            'type': 'flick_answer',
            'answers': event['answer_data']
        }))

    async def send_existing_answers(self):
        questions = await sync_to_async(list)(
            FlickQuestion.objects.filter(user_id=self.user_id).order_by('-created_at')
        )

        all_answers = []
        for question in questions:
            answers = await sync_to_async(list)(
                FlickAnswer.objects.filter(question=question).select_related('responder__profile')
            )

            for answer in answers:
                user_image = await sync_to_async(UserImage.objects.filter(user=answer.responder).first)()
                
                # Check if a match exists between the current user and the responder
                is_matched = await sync_to_async(Match.objects.filter(
                    Q(user1_id=self.user_id, user2=answer.responder) |
                    Q(user1=answer.responder, user2_id=self.user_id)
                ).exists)()

                all_answers.append({
                    'id': answer.id,
                    'answer_text': answer.answer_text,
                    'created_at': localtime(answer.created_at).strftime('%Y-%m-%d %H:%M:%S'),
                    'question_text': question.question_text,
                    'responder': {
                        'id': answer.responder.id,
                        'username': answer.responder.username,
                        'profile_image': user_image.image1.url if user_image and user_image.image1 else None,
                        'profile_url': f"/profile/{answer.responder.id}/",
                        'is_matched': is_matched  # Include match status
                    }
                })

        await self.send(text_data=json.dumps({
            'type': 'previous_answers',
            'answers': all_answers
        }))