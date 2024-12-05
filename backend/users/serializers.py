from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password,check_password
from django.contrib.auth import authenticate


##User 
class UserSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True) 
    class Meta:
        model = Users
        fields = ['id','username','email','password','confirmPassword']
        extra_kwargs = {'password':{'write_only':True}}

    def validate(self, data):
        # Check if password and confirm_password match
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Password fields didn't match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        validated_data["password"] = make_password(validated_data.get("password"))
        
        return super().create(validated_data)

##UserVerification
class VerificationSerializer(serializers.Serializer):
    otp = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()

    def validate(self, data):
        otp = data.get('otp')
        token = data.get('token')

        # Ensure that at least one of OTP or token is provided
        if not otp and not token:
            raise serializers.ValidationError("OTP or click the link on Email for verification.")

        # If OTP is provided, it must be non-empty
        if otp and not otp.strip():
            raise serializers.ValidationError("OTP cannot be empty.")

        return data



##Login
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)    

    def validate(self, data):
        try:
            user = Users.objects.get(email=data['email'])
        except Users.DoesNotExist:
            raise serializers.ValidationError({"email": "Email not found please Register"})

        if not check_password(data['password'], user.password):
            raise serializers.ValidationError({"password":"Invalid password"})

        if not user.is_active:
            raise serializers.ValidationError({"email":"Your account is blocked. Please contact support for assistance"})

        if not user.is_email_verified:
            raise serializers.ValidationError({"email":"Email is not verified. Please verify your email."})

        data['user'] = user
        return data

##UserList
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["username","email","date_joined","last_login","is_email_verified","is_active"]
