##Genereted
from django.shortcuts import render
from rest_framework.response import Response,
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




class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        existing_user = Users.objects.filter(email=email).first()

        if existing_user:
            if not existing_user.is_email_verified:
                verification = existing_user.verification
                resend_url = reverse('resend_verification', args=[verification.token])
                return Response(
                    {
                        'message': 'This email already exists but is not verified. Click the link to resend verification.',
                        'resend_link': request.build_absolute_uri(resend_url)
                    },
                    status=status.HTTP_409_CONFLICT
                )
            else:
                return Response({'email': ['This email is already registered.']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            verification = Verification.objects.create(user=user, otp=str(random.randint(100000, 999999)))
            verification.token = verification.generate_verification_hash()
            verification.save()

            # Send verification email asynchronously
            send_email.delay(user.id, verification.token)

            return Response(
                {'message': 'OTP and verification link have been sent to your email. Please verify your email.'},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)