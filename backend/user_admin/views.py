from django.shortcuts import render
from rest_framework.views import APIView
from users.models import Users  # Ensure this is the correct import
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.core.exceptions import ValidationError
from .permissions import IsSuperUser
from rest_framework.pagination import PageNumberPagination
from users.serializers import *
from .serializers import *
from .models import *


# Create your views here.

class UserCount(APIView):
    def get(self, request):
        # Count total users
        total_users = Users.objects.count()
        
        # Count active users
        active_users = Users.objects.filter(is_email_verified=True, is_active = True).count()

        # Active match count
        match_count = Match.objects.filter(is_active = True).count()

        # Return the response
        return Response(
            {
                'total_users': total_users,
                'active_users': active_users,
                'match_count': match_count,

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
        
class UserAccountStatus(APIView):
    permission_classes=[IsSuperUser]

    def post(self,request,user_id):

        print(user_id,"***********************USER ID in UserAccountStatus")

        try:
            user_data = Users.objects.get(id=user_id)
            user_data.is_active = not user_data.is_active
            print(user_data.is_active,"***************USER STATUS IN ADMIN VIEW")
            user_data.save()

            return Response(
                {"message":"User status updated successfully",
                 "is_active":user_data.is_active},
                status=status.HTTP_200_OK
            )
        except Users.DoesNotExist:
            return Response(
                {
                    "message":"User not Found",
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e,"**********************Error is User status")
            return Response(
                {
                    "message":"Error during UserStatus updation"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        

class SubscriptionPlanViewSet(viewsets.ViewSet):

    permission_classes = [IsSuperUser]

    queryset = SubscriptionPlan.objects.all()
    
    def list(self, request):
        plans = SubscriptionPlan.objects.all()
        serializer = SubscriptionPlanSerializer(plans, many = True)

        return Response(serializer.data)
    

    def create(self, request):
        if SubscriptionPlan.objects.filter(is_active=True, is_paused=False).count() >= 3:
            return Response({"error": "Cannot have more than 3 active plans."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SubscriptionPlanSerializer(data = request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def pause_plan(self, request, pk=None):
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_paused = True
            '''Ensure the plan is active so that 
            the already subscribed users may enjoy the perks they subscribed for'''
            plan.is_active = True 
            plan.save()
            return Response({"message": "Subscription plan paused successfully."},status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def unpause_plan(self,request,pk=None):
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_paused= False
            plan.is_active = True
            plan.save()

            return Response({"message": "Subscription plan un-paused successfully."},status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def deactivate_plan(self,request,pk=None):
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_active = False
            plan.is_paused = True

            plan.save()

            return Response({'message':'Subscription plan deactivated successfully'},status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def reactivate_plan(self,request,pk=None):
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_active = True
            plan.is_paused = False

            plan.save()

            return Response({'message':'Subscription plan reactivated successfully'},status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)
        


class SubscriptionStatsAPI(viewsets.ViewSet):
    permission_classes = [IsSuperUser]

    def list(self, request):
        # Get basic stats
        total_plans = SubscriptionPlan.objects.count()
        active_plans = SubscriptionPlan.objects.filter(is_active=True, is_paused=False).count()
        

        return Response({
            'total_plans': total_plans,
            'active_plans': active_plans,
        })
    


# class WeeklySubscriptionDataAPI(APIView):
#     permission_classes = [IsSuperUser]

#     def get(self, request):
#         # Get subscriptions created in last 7 days
#         from django.utils.timezone import now
#         from datetime import timedelta

#         date_map = {}
#         for i in range(6, -1, -1):
#             date = (now() - timedelta(days=i)).date()
#             date_map[date.strftime('%a')] = 0  # Initialize with 0

#         subscriptions = UserSubscription.objects.filter(
#             created_at__gte=now() - timedelta(days=6)
#         ).extra({
#             'day': "to_char(created_at, 'Dy')"
#         }).values('day').annotate(
#             count=Count('id')
#         )

#         for sub in subscriptions:
#             date_map[sub['day']] = sub['count']

#         formatted_data = [{
#             'day': day,
#             'subscriptions': count
#         } for day, count in date_map.items()]

#         return Response(formatted_data)
