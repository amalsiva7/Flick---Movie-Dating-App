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


class ChatUserImageView(APIView):
    def get(self, request, user_id):
        try:
            # Convert user_id to integer if it's coming as string
            user = Users.objects.get(pk=int(user_id))
        except Users.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"detail": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ChatUserSerializer(user, context={'request': request})
        return Response(serializer.data)