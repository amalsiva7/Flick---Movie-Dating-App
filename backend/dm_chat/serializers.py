from rest_framework import serializers
from .models import Users, UserImage, Match
from dm_chat.models import ChatRoom,ChatMessage
from django.utils import timezone


class MatchedUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    chat_room_id = serializers.SerializerMethodField()

    class Meta:
        model = Users
        fields = ('id', 'username', 'email', 'profile_image', 'last_seen','chat_room_id')

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

    def get_last_seen(self, user):
         """
        Returns the time difference between the current time and the user's last login.
        """
         if user.last_login:
            now = timezone.now()
            time_difference = now - user.last_login
            days = time_difference.days
            hours, remainder = divmod(time_difference.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)

            if days > 0:
                return f"{days} days ago"
            elif hours > 0:
                return f"{hours} hours ago"
            elif minutes > 0:
                return f"{minutes} minutes ago"
            else:
                return "Just now"
         else:
            return "Never"
         
    def get_chat_room_id(self, matched_user):
        # The current user is available in serializer context
        current_user = self.context.get('current_user')
        if not current_user:
            return None

        # Generate chat room ID by sorting user IDs to ensure uniqueness
        user_ids = sorted([str(current_user.id), str(matched_user.id)])
        return f"chat_{user_ids[0]}_{user_ids[1]}"
    

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    timestamp = serializers.DateTimeField(format='%d-%m-%y %H:%M')

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'timestamp']

    message = serializers.CharField(source='content')



class ChatUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Users # Use the User model, not 'Users'
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