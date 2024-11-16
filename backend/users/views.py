from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password

# Create your views here.

class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'User created successfully'},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
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
            raise AuthenticationFailed('User not found.')
        
        #JWT
        refresh = RefreshToken.for_user(user)
        
        context ={
            'message': 'Login Success',
            'refresh':str(refresh),
            'access' : str(refresh.access_token),
        }
        
        return Response(context,status=status.HTTP_200_OK)