from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .serializers import *
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from .tasks import send_email
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now
from django.http import HttpResponseRedirect
from .utils import *
from rest_framework.parsers import MultiPartParser,FormParser
from django.db.models import Q
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import stripe
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import redirect
from django.urls import reverse

# Create your views here.


##Account Creation
class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        existing_user = Users.objects.filter(email=email).first()

        if existing_user:

            if not existing_user.is_email_verified:
                send_email.delay(existing_user.id)
                return Response(
                    {'message': ['This email already exists but is not verified. Please verify using the otp/ link send to your email.']},
                    status=status.HTTP_409_CONFLICT
                )
            else:
                return Response({'email': ['This email is already registered']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
        print(f"Serializer: {serializer}********************NEW USER******************************")
        print(f"is_valid :   {serializer.is_valid()}********************************")
        if serializer.is_valid():
            user = serializer.save()  # User is inactive until email is verified
  
            # Send OTP email asynchronously
            send_email.delay(user.id)


            return Response({'message': 'OTP has been sent to your Email. Please verify your email.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


##Verification of Email (Signup)
class VerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        

        serializer = VerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        otp = request.data.get('otp')
        token = request.query_params.get('token')
        email = request.data.get('email')

        try:
            user = Users.objects.get(email=email)
            verification = Verification.objects.get(user=user)

            if verification.is_verified:
                return Response({"message": "User is already verified."}, status=status.HTTP_200_OK)

            if verification.is_expired():
                print(verification.is_expired())
                return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_410_GONE)
            

            # Verify OTP or token
            if otp and otp == verification.otp:
                verification.is_verified = True
                user.is_email_verified = True
                user.save()
                verification.save()
                return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

            elif token and token == verification.token:
                verification.is_verified = True
                user.is_email_verified = True
                user.save()
                verification.save()
                return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid OTP or token."}, status=status.HTTP_400_BAD_REQUEST)

        except Users.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Verification.DoesNotExist:
            return Response({"error": "No verification record found."}, status=status.HTTP_404_NOT_FOUND)


class VerificationMagicLinkView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        token = request.query_params.get('token')
        print(f"Received token: {token}")  # Logs the received token

        if not token:
            print("Token is missing.")
            return Response({"error": "Token is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = Verification.objects.get(token=token)

            if verification.is_verified:
                print(f"Token {token} already verified.")
                return HttpResponseRedirect('http://localhost:3000/login')

            if verification.is_expired():
                print(f"Token {token} has expired.")
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_410_GONE)

            verification.is_verified = True
            verification.user.is_email_verified = True
            verification.user.save()
            verification.save()
            print(f"Token {token} verified successfully.")
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

        except Verification.DoesNotExist:
            print(f"Token {token} does not exist.")
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_404_NOT_FOUND)





##Resend OTP
class ResendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.get(email=email)

            if not user.is_email_verified:  # Check if the user is not verified
                # Trigger resend OTP via Celery task and pass 'force=True' to regenerate OTP
                verification = Verification.objects.get(user=user)
                verification.generate_otp(force=True)  # Regenerate OTP
                send_email.delay(user.id)  # Send the updated OTP

                return Response({"message": "OTP has been resent to your email. Please verify."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        except Users.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)





##Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        # print(serializer.is_valid(),"********************SERIALIZER IN LOGIN")
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims to both refresh and access tokens
            refresh['user_id'] = user.id
            refresh['username'] = user.username
            refresh['isAdmin'] = user.is_superuser
            refresh['isAuthenticated'] = True

            # Access token inherits claims from refresh token
            access_token = refresh.access_token
            
            return Response({
                'message': 'Login Successful',
                'refresh': str(refresh),
                'access': str(access_token),
                'username': user.username,  # Send username in response
                'user_id': user.id  # Send user_id in response
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)




##Display UserProfile
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):

        print("Call to ProfileView")
        print("request.user.is_profile_updated",request.user)

        if not request.user.is_profile_updated:
                return Response({
                    "error": "Profile not completed",
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_profile_updated": False
                }, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)
            profile_data = serializer.data
            profile_data["last_updated_at"] = format_time_difference(profile.last_updated_at)


            return Response(profile_data, status=200)
        except Profile.DoesNotExist:
            return Response({
                "error": "Profile not found",
                "username": request.user.username,
                "email": request.user.email,
                "is_profile_updated": False
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


##Create UserProfile View
class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        # Check if the user already has a profile
        if Profile.objects.filter(user=request.user).exists():
            return Response({"message": "Profile already created!"}, status=status.HTTP_200_OK)

        # If no profile exists, create a new one
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save(user=request.user)


            request.user.is_profile_updated = True
            request.user.save()

            profile = Profile.objects.get(user=request.user)


            last_updated_str = format_time_difference(profile.last_updated_at)
            return Response({"message": "Profile created successfully!",
                            "last_updated_at": last_updated_str,
                            "is_profile_updated": True}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


##Update UserProfile View
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]


    def patch(self, request):
        try:
            print("Call to UpdateProfileView")
            # Retrieve the user's existing profile
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"message": "Profile not found!"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the profile with the provided data
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            last_updated_str = format_time_difference(profile.last_updated_at)
            return Response({"message": "Profile updated successfully!",
                              "last_updated_at": last_updated_str}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    

class SetProfilePicView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser,FormParser]

    def post(self, request):
        try:
            # print("Request Data:", request.data)
            # print("Request Files:", request.FILES)  # Debug file data
            # print("Request Headers:", request.headers)

            if not request.FILES:
                return Response(
                    {
                        "error": "No files uploaded",
                        "debug_info": {
                            "content_type": request.content_type,
                            "files_received": bool(request.FILES),
                            "headers": dict(request.headers),
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            


            user = request.user

            user_image, created = UserImage.objects.get_or_create(user=user)

            #Pass the request data to the serializer for validation
            serializer = UserImageSerializer(user_image, data=request.data, partial=True)

            if serializer.is_valid():
                # Save the updated UserImage instance with the new images
                serializer.save()

                

                
                return Response(
                    {"message": "Images uploaded successfully!", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            # Retrieve the UserImage instance for the user
            user_image = UserImage.objects.get(user=request.user)
            serializer = UserImageSerializer(user_image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserImage.DoesNotExist:
            return Response({"error": "No images found for this user."}, status=status.HTTP_404_NOT_FOUND)


class UpdateProfilePicView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            # Retrieve the UserImage instance for the authenticated user
            user_image = UserImage.objects.get(user=request.user)

            # Pass the request data to the serializer for partial update
            serializer = UserImageSerializer(user_image, data=request.data, partial=True)

            if serializer.is_valid():
                # Save the updated fields
                serializer.save()
                user_image.full_clean()
                return Response(
                    {"message": "Profile picture updated successfully!", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except UserImage.DoesNotExist:
            return Response(
                {"error": "No profile images found for this user. Please upload first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

    def delete(self, request, *args, **kwargs):
        try:
            # Retrieve UserImage instance
            user_image = UserImage.objects.get(user=request.user)

            # Get the image field to delete
            image_field = request.data.get("image_field")
            if not image_field or not hasattr(user_image, image_field):
                return Response(
                    {"error": "Invalid image field specified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get the image file and delete it if it exists
            image_file = getattr(user_image, image_field)
            if image_file:
                # Delete the file from storage
                image_file.delete(save=False)
                # Remove reference from the database
                setattr(user_image, image_field, None)
                user_image.save()

                return Response(
                    {"message": f"{image_field} removed successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": f"{image_field} does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        except UserImage.DoesNotExist:
            return Response(
                {"error": "No profile images found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'has_next': self.page.has_next(),
            'has_previous': self.page.has_previous()
        })



class PotentialMatchesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = DatingCardSerializer


    def get_queryset(self,request):
        print("Potential match views get called")
        current_user = request.user
        current_profile = current_user.profile

        user_gender = current_profile.gender
        user_preference = current_profile.gender_preferences

        seen_profiles = ActionHistory.objects.filter(
            user=current_user
        ).values_list('target_user_id', flat=True)

        base_filters = Q(
            is_active=True,
            is_email_verified=True,
            is_profile_updated=True,
            profile__isnull=False,
            images__isnull=False
        )

        if user_preference == 'bi':
            match_filter = Q(profile__gender_preferences=user_gender) | Q(profile__gender_preferences='bi')
        else:
            match_filter = Q(profile__gender=user_preference) & (Q(profile__gender_preferences=user_gender) | Q(profile__gender_preferences='bi'))

        potential_matches = Users.objects.select_related('profile', 'images').exclude(
            id__in=seen_profiles
        ).exclude(
            id=current_user.id
        ).filter(
            base_filters & match_filter
        )

        age_min = self.request.query_params.get('age_min')
        age_max = self.request.query_params.get('age_max')
        match_min = self.request.query_params.get('match_min')
        match_max = self.request.query_params.get('match_max')
        location = self.request.query_params.get('location')

        if age_min:
            potential_matches = [
                user for user in potential_matches if user.profile.birth_date and 
                (datetime.today().year - user.profile.birth_date.year) >= int(age_min)
            ]

        if age_max:
            potential_matches = [
                user for user in potential_matches if user.profile.birth_date and 
                (datetime.today().year - user.profile.birth_date.year) <= int(age_max)
            ]

        if match_min or match_max:
            potential_matches = [
                user for user in potential_matches 
                if (match_min is None or calculate_match_percentage(current_profile, user.profile) >= int(match_min))
                and (match_max is None or calculate_match_percentage(current_profile, user.profile) <= int(match_max))
            ]
        
        if location:
            potential_matches = [
                user for user in potential_matches if user.profile.location and 
                user.profile.location.get('city', '').lower() == location.lower()
            ]

        return potential_matches

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(request)
        paginator = self.pagination_class()
        paginated_matches = paginator.paginate_queryset(queryset, request)
        
        if paginated_matches:
            serializer = self.get_serializer(paginated_matches, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        else:
            return Response({"message": "No more profiles available"}, status=status.HTTP_404_NOT_FOUND)

class ActionView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        user_action = request.data.get('action')

        if not target_user_id:
            return Response({"error": "target_user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_action not in ['reject', 'flick_message']:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = Users.objects.get(id=target_user_id)
        except Users.DoesNotExist:
            return Response({"error": "Target user not found"}, status=status.HTTP_404_NOT_FOUND)
        
        action_record, created = ActionHistory.objects.update_or_create(
            user=request.user,
            target_user=target_user,
            defaults={'action': user_action}
        )

        channel_layer = get_channel_layer()

        if user_action == 'flick_message':
            notification = Notification.objects.create(
                recipient=target_user,
                sender=request.user,
                notification_type='flick',
                title='New Flick Received',
                message=f'{request.user.username} sent you a flick!'
            )

            async_to_sync(channel_layer.group_send)(
                f"user_{target_user.id}",
                {
                    'type': 'send_notification',
                    'message': {
                        'id': notification.id,
                        'notification_type': notification.notification_type,
                        'title': notification.title,
                        'message': notification.message
                    }
                }
            )

            mutual_interest = ActionHistory.objects.filter(
                user_id=target_user,
                target_user=request.user,
                action='flick_message'
            ).exists()

            if mutual_interest:
                match = Match.objects.create(user1=request.user, user2=target_user)
                
                async_to_sync(channel_layer.group_send)(
                    f"user_{request.user.id}",
                    {'type': 'send_notification', 'message': {"type": "match", "message": "It's a match!"}}
                )
                async_to_sync(channel_layer.group_send)(
                    f"user_{target_user.id}",
                    {'type': 'send_notification', 'message': {"type": "match", "message": "It's a match!"}}
                )

                return Response({"message": "It's a match!", "matched": True})

        return self.get_next_profile(request)
    
    def get_next_profile(self, request):
        url = reverse('potential-matches')
        return redirect(url)
    

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != int(user_id):
            return Response({'error':'Unauthorized user'},status=status.HTTP_403_FORBIDDEN )
        
        notifications = Notification.objects.filter(recipient = request.user).order_by('-created_at')

        unread_count = notifications.filter(is_read = False).count()

        notifications_data = [
            {
                'id':notification.id,
                'message' : notification.message,
                'read': notification.is_read,
                'timestamp':notification.created_at
            }
            for notification in notifications
        ]

        return Response({
            "notifications": notifications_data,
            "unread_count": unread_count
        })
    
class MarkNotificationsAsRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.id != int(user_id):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Mark all unread notifications as read
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)

        return Response({"message": "Notifications marked as read"})



class FlickQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = FlickQuestion.objects.filter(user=request.user)[:10]
        serializer = FlickQuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FlickQuestionSerializer(data=request.data)
        if serializer.is_valid():
            #Deactivate all previous active questions
            FlickQuestion.objects.filter(user=request.user, is_active=True).update(is_active=False)
            
            #Save new question
            # serializer.save(user=request.user)
            question = serializer.save(user=request.user)

            # In FlickQuestionView
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'flick_{request.user.id}',
                {
                    'type': 'send_flick_message',
                    'flick_data': {
                        'id': question.id,
                        'question_text': question.question_text,
                        'created_at': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                        'is_active': True,
                        'username': request.user.username 
                    }
                }
            )

            
            #Create notification for new question
            # notification = Notification.objects.create(
            #     recipient=request.user,
            #     message=f"Your question was posted: {question.question_text[:30]}{'...' if len(question.question_text) > 30 else ''}",
            # )
            
            # #Send real-time notification
            # channel_layer = get_channel_layer()
            # async_to_sync(channel_layer.group_send)(
            #     f'user_{request.user.id}',
            #     {
            #         'type': 'send_notification',
            #         'message': {
            #             'id': notification.id,
            #             'message': notification.message,
            #         }
            #     }
            # )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ActiveQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        print(f"Active question got called for user_id: {user_id}")

        question = FlickQuestion.objects.filter(user_id=user_id, is_active=True).first()
        if question:
            return Response({
                'id': question.id,
                'question_text': question.question_text,
                'created_at': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'is_active': question.is_active,
            })
        return Response({"message": "No active question found for this user."}, status=404)



class FlickAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request,user_id):

        print('Flick Answer is  called in view')

        answer = FlickAnswer


# class CreateStripeCheckoutSessionView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         plan_id = request.data.get('plan_id')
#         if not plan_id:
#             return Response({"error": "Plan ID is required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             plan = SubscriptionPlan.objects.get(pk=plan_id)
#             # print(plan.stripe_price_id,"THIS IS THE PLAN ID **********************")
#             # print(settings.STRIPE_SUCCESS_URL,"THIS IS THE success url  **********************")
#             # print(settings.STRIPE_CANCEL_URL,"THIS IS THE CANCEL url  **********************")
#             # Create a Stripe Checkout Session
#             checkout_session = stripe.checkout.Session.create(
#                 payment_method_types=['card'],
#                 line_items=[{
#                     'price': plan.stripe_price_id,  # Use the Stripe Price ID from the plan
#                     'quantity': 1,
#                 }],
#                 mode='subscription',
#                 success_url=settings.STRIPE_SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
#                 cancel_url=settings.STRIPE_CANCEL_URL,
#             )
#             # print(checkout_session.url,"checkout_session.url  **********************")

#             return Response({'checkout_url': checkout_session.url, 'session_id': checkout_session.id}, status=status.HTTP_200_OK)

#         except SubscriptionPlan.DoesNotExist:
#             return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class StripeWebhookView(APIView):
#     permission_classes = [AllowAny]
#     def post(self, request, format=None):
#         payload = request.body
#         sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
#         event = None

#         try:
#             event = stripe.Webhook.construct_event(
#                 payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
#             )
#         except ValueError as e:
#             # Invalid payload
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#         except stripe.error.SignatureVerificationError as e:
#             # Invalid signature
#             return Response(status=status.HTTP_400_BAD_REQUEST)

#         # Handle the event
#         if event['type'] == 'checkout.session.completed':
#             session = event['data']['object']

#             # Fulfill the purchase...
#             handle_checkout_session(session)

#         elif event['type'] == 'invoice.payment_succeeded':
#             session = event['data']['object']
#             handle_invoice_payment_succeeded(session)
#         # ... handle other event types
#         else:
#             print('Unhandled event type {}'.format(event['type']))

#         return Response(status=status.HTTP_200_OK)

# def handle_checkout_session(session):
#     # Retrieve the subscription ID and customer ID from the session
#     stripe_subscription_id = session.get('subscription')
#     stripe_customer_id = session.get('customer')
#     print(session,"THIS IS THE SESSION ID")
#     # Use the customer ID to retrieve the customer object
#     customer = stripe.Customer.retrieve(stripe_customer_id)
#     customer_email = customer.get('email')
#     # Retrieve user from database
#     try:
#         user = Users.objects.get(email=customer_email)
#     except Users.DoesNotExist:
#         print(f"User not found with email: {customer_email}")
#         return

#     # Get the Stripe subscription object
#     stripe_subscription = stripe.Subscription.retrieve(stripe_subscription_id)
#     stripe_price_id = stripe_subscription['items']['data'][0]['price']['id']
#     # print(stripe_price_id,"THIS IS THE stripe_price_id **********************")

#     try:
#         plan = SubscriptionPlan.objects.get(stripe_price_id=stripe_price_id)
#     except SubscriptionPlan.DoesNotExist:
#         print(f"SubscriptionPlan not found with stripe_price_id: {stripe_price_id}")
#         return
#     # Calculate the end date based on the plan duration
#     end_date = timezone.now() + timedelta(days=plan.duration_days)

#     # Create or update the UserSubscription object
#     user_subscription, created = UserSubscription.objects.get_or_create(
#         user=user,
#         defaults={
#             'plan': plan,
#             'stripe_subscription_id': stripe_subscription_id,
#             'end_date': end_date,
#             'is_active': True,
#         }
#     )

#     if not created:
#         user_subscription.plan = plan
#         user_subscription.stripe_subscription_id = stripe_subscription_id
#         user_subscription.end_date

