from django.shortcuts import render
from rest_framework.views import APIView
from users.models import Users  # Ensure this is the correct import
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsSuperUser

# Create your views here.

class UserCount(APIView):
    def get(self, request):
        # Count total users
        total_users = Users.objects.count()
        
        # Count active users
        active_users = Users.objects.filter(is_active=True).count()

        # Return the response
        return Response(
            {
                'total_users': total_users,
                'active_users': active_users,
            },
            status=status.HTTP_200_OK
        )


class UserList(APIView):
    permission_classes=[IsSuperUser]

    