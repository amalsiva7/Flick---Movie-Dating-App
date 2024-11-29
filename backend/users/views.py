from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
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
                    {'message': ['This email already exists but is not verified. Please verify.']},
                    status=status.HTTP_409_CONFLICT
                )
            else:
                return Response({'email': ['This email is already registered']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
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
                return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
            

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





##Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    'message':'Login Succesfully',
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
