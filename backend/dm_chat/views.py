from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Match
from .serializers import MatchedUserSerializer


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

