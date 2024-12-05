from django.shortcuts import render
from rest_framework.views import APIView
from users.models import Users  # Ensure this is the correct import
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsSuperUser
from rest_framework.pagination import PageNumberPagination
from users.serializers import *

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

    def get(self,request):
        try:
            pagination = PageNumberPagination()
            pagination.page_size = 5

            users = Users.objects.filter(is_superuser = False).order_by('-date_joined')

            result_page = pagination.paginate_queryset(users,request)

            serializer = UserListSerializer(result_page,many =True)

            print(result_page)
            print(serializer.data,"********SERIALIZER DATA***************")

            return pagination.get_paginated_response(serializer.data)
        except Users.DoesNotExist:
            return Response(
                {'error':"User not found"},status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error":"An error occured while fetching the userlist"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
