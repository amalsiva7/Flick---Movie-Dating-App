from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from users.models import Match
from .models import *
from .serializers import MatchedUserSerializer
from rest_framework.pagination import PageNumberPagination




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


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_room_name):
        # Retrieve the chat room
        chat_room = ChatRoom.objects.get(name=chat_room_name)
        messages = Message.objects.filter(room=chat_room).order_by('-timestamp')

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Adjust page size to the number of messages you want to load initially
        result_page = paginator.paginate_queryset(messages, request)

        # Serialize messages and send response
        message_data = [
            {
                "sender": message.sender.username,
                "content": message.content,
                "timestamp": message.timestamp,
            }
            for message in result_page
        ]
        return paginator.get_paginated_response(message_data)
