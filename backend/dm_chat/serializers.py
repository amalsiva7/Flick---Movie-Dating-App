from rest_framework import serializers
from .models import Users, UserImage, Match
from dm_chat.models import ChatRoom, ChatMessage
from django.utils import timezone
from django.utils.timezone import localtime
from django.db.models import Q

class MatchedUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    chat_room_id = serializers.SerializerMethodField()  # This will now be the ChatRoom ID (string)
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_message_count = serializers.SerializerMethodField()

    class Meta:
        model = Users
        fields = (
            'id', 'username', 'email', 'profile_image', 'last_seen',
            'chat_room_id', 'last_message', 'last_message_time', 'unread_message_count'
        )

    def get_profile_image(self, user):
        try:
            user_image = UserImage.objects.get(user=user)
            if user_image.image1: return user_image.image1.url
            elif user_image.image2: return user_image.image2.url
            elif user_image.image3: return user_image.image3.url
            elif user_image.image4: return user_image.image4.url
            return None
        except UserImage.DoesNotExist:
            return None

    def get_last_seen(self, user):
        if user.last_login:
            now = timezone.now()
            time_difference = now - user.last_login
            days = time_difference.days
            hours, remainder = divmod(time_difference.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            if days > 0: return f"{days} days ago"
            elif hours > 0: return f"{hours} hours ago"
            elif minutes > 0: return f"{minutes} minutes ago"
            else: return "Just now"
        else:
            return "Never"

    def get_chat_room_id(self, matched_user):
        """
        Returns the chat_room_id string as per your frontend requirement, e.g., 'chat_58_60'.
        """
        current_user = self.context.get('current_user')
        if not current_user:
            return None
        user_ids = sorted([str(current_user.id), str(matched_user.id)])
        return f"chat_{user_ids[0]}_{user_ids[1]}"

    def _get_chat_room_instance(self, matched_user):
        """
        Returns the actual ChatRoom instance for two users, or None if not found.
        """
        current_user = self.context.get('current_user')
        return ChatRoom.objects.filter(
            (Q(user1=current_user, user2=matched_user) |
             Q(user1=matched_user, user2=current_user))
        ).first()

    def get_last_message(self, matched_user):
        chat_room = self._get_chat_room_instance(matched_user)
        if not chat_room:
            return ""
        last_msg = ChatMessage.objects.filter(room=chat_room).order_by('-timestamp').first()
        if last_msg:
            return last_msg.content
        return ""

    def get_last_message_time(self, matched_user):
        chat_room = self._get_chat_room_instance(matched_user)
        if not chat_room:
            return ""
        last_msg = ChatMessage.objects.filter(room=chat_room).order_by('-timestamp').first()
        if last_msg:
            local_time = localtime(last_msg.timestamp)
            return local_time.strftime("%H:%M")
        return ""

    def get_unread_message_count(self, matched_user):
        current_user = self.context.get('current_user')
        chat_room = self._get_chat_room_instance(matched_user)
        if not chat_room:
            return 0
        return ChatMessage.objects.filter(room=chat_room, is_read=False, receiver=current_user).count()


    

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.id', read_only=True)
    timestamp = serializers.DateTimeField(format='%d-%m-%y %H:%M')

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'timestamp']

    message = serializers.CharField(source='content')



class ChatUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Users
        fields = ['id', 'username', 'profile_image']

    def get_profile_image(self, user):
        try:
            user_image = UserImage.objects.get(user=user)  # Assuming OneToOne relationship
            if user_image.image1:
                return user_image.image1.url
            elif user_image.image2:
                return user_image.image2.url
            elif user_image.image3:
                return user_image.image3.url
            elif user_image.image4:
                return user_image.image4.url
            return None
        except UserImage.DoesNotExist:
            return None