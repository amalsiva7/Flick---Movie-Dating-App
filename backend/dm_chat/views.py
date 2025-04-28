from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from users.models import Match
from .models import *
from .serializers import MatchedUserSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from .serializers import *



class MatchedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        matches = Match.objects.filter(Q(user1=user) | Q(user2=user), is_active=True)

        matched_users = []
        for match in matches:
            if match.user1 != user:
                matched_users.append(match.user1)
            else:
                matched_users.append(match.user2)

        serializer = MatchedUserSerializer(matched_users, many=True, context={'current_user': user})
        return Response(serializer.data, status=status.HTTP_200_OK)



class ChatMessagePagination(PageNumberPagination):
    page_size = 20  # Number of messages per page
    page_size_query_param = 'page_size'
    max_page_size = 50

class ChatMessageListView(ListAPIView):
    serializer_class = ChatMessageSerializer
    pagination_class = ChatMessagePagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        room_name = self.kwargs['room_name']
        try:
            chat_room = ChatRoom.objects.get(name=room_name)
        except ChatRoom.DoesNotExist:
            return ChatMessage.objects.none()

        # Return messages ordered by timestamp descending (latest first)
        return ChatMessage.objects.filter(room=chat_room).order_by('-timestamp')


class ChatUserDetailView(APIView):
    def get(self, request, user_id):
        print("*************************Call came to ChatUserImageView in dm_chat View********************")

        try:
            user = Users.objects.get(pk=user_id)
        except Users.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChatUserSerializer(user, context={'request': request})
        return Response(serializer.data)
    

class MarkMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_room_id):
        user = request.user

        # Parse chat_room_id string like 'chat_58_60'
        try:
            parts = chat_room_id.split('_')
            if len(parts) != 3:
                return Response({"detail": "Invalid chat_room_id format."}, status=status.HTTP_400_BAD_REQUEST)
            user1_id, user2_id = int(parts[1]), int(parts[2])
        except ValueError:
            return Response({"detail": "Invalid user IDs in chat_room_id."}, status=status.HTTP_400_BAD_REQUEST)

        chat_room = ChatRoom.objects.filter(
            (Q(user1_id=user1_id) & Q(user2_id=user2_id)) |
            (Q(user1_id=user2_id) & Q(user2_id=user1_id))
        ).first()

        if not chat_room:
            return Response({"detail": "Chat room not found."}, status=status.HTTP_404_NOT_FOUND)

        # Mark unread messages as read
        ChatMessage.objects.filter(room=chat_room, receiver=user, is_read=False).update(is_read=True)

        return Response({"detail": "Messages marked as read."}, status=status.HTTP_200_OK)