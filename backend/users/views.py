from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from .tasks import send_otp_email
from rest_framework.exceptions import ValidationError
# Create your views here.



class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')

        try:
            existing_user = Users.objects.filter(email=email).first()

            if existing_user:
                if not existing_user.is_email_verified:
                    existing_user.delete()
                else:
                    return Response({'email':['This is email is already registered']},status=status.HTTP_400_BAD_REQUEST)
        except Users.DoesNotExist:
            pass

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # User is inactive until email is verified
            
            # Send OTP email asynchronously
            send_otp_email.delay(user.id)

            return Response({'message': 'OTP has been send to your Email.Please verify your email.'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


##Verify OTP
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data['email']
            otp = request.data['otp']
        except KeyError:
            raise ValidationError("Email and OTP are required.")

        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            raise ValidationError("User with this email does not exist.")

        if user.is_email_verified:
            return Response({"message": "Your email is already verified."}, status=status.HTTP_400_BAD_REQUEST)##200

        if user.is_otp_expired():
            raise ValidationError("OTP has expired. Please request a new one.")

        if user.otp != otp:
            raise ValidationError("Invalid OTP.")

        # Mark user as verified and activate account
        user.is_email_verified = True
        user.save()

        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        


class CreateLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        try:
            email = request.data['email']
            password = request.data['password']
        except KeyError:
            raise ParseError('All fields are required')
        
        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            raise AuthenticationFailed("Email not found. Please register")
        
        if not user.is_active:
            raise AuthenticationFailed("Your account have been blocked please contact Flick Team for further information.")
        

        if not check_password(password,user.password):
            raise AuthenticationFailed("Invalid password")

        
        user = authenticate(username=email, password=password)

        if user is None:
            raise AuthenticationFailed('Invalid Credentials.')
        
        #JWT
        refresh = RefreshToken.for_user(user)
        
        context ={
            'message': 'Login Success',
            'refresh':str(refresh),
            'access' : str(refresh.access_token),
        }
        
        return Response(context,status=status.HTTP_200_OK)
    

