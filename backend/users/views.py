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
from django.http import HttpResponseRedirect
from .utils import *


# Create your views here.


##Account Creation
class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        existing_user = Users.objects.filter(email=email).first()

        if existing_user:
            print(f"Inside....existing user : {existing_user}************************************")

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
        print(serializer.is_valid(),"********************SERIALIZER IN LOGIN")
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            refresh['isAdmin'] = user.is_superuser

            return Response(
                {
                    'message':'Login Succesfully',
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)




##Display UserProfile
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)

            profile_data = serializer.data
            profile_data["last_updated_at"] = format_time_difference(profile.last_updated_at)

            return Response(profile_data, status=200)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=404)



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
            profile = Profile.objects.get(user=request.user)

            serializer.save(user=request.user)
            last_updated_str = format_time_difference(profile.last_updated_at)
            return Response({"message": "Profile created successfully!",
                            "last_updated_at": last_updated_str}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


##Update UserProfile View
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
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
    

