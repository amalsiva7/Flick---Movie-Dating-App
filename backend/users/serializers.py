from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password,check_password
from django.contrib.auth import authenticate
from datetime import datetime


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
        fields = ["id","username","email","date_joined","last_login","is_email_verified","is_active"]


#UserProfile
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ['birth_date', 'gender', 'location', 'interests', 'gender_preferences']

    def get_age(self, obj):
        today = datetime.today()
        return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))

    def validate_birth_date(self, value):
        today = datetime.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Age must be above 18 to create a profile.")
        return value
    
    def validate_interests(self, value):
        if isinstance(value, str):
            value = [interest.strip() for interest in value.split(",")]

        if len(value) < 10:
            raise serializers.ValidationError("A minimum of 10 interests is required.")
        return value



class UserImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserImage
        fields = ['image1', 'image2', 'image3', 'image4']

    def validate(self, data):
        """Ensure no more than 4 images are uploaded and all are valid."""
        images = [data.get('image1'), data.get('image2'), data.get('image3'), data.get('image4')]
        uploaded_images = [image for image in images if image]

        if len(uploaded_images) > 4:
            raise serializers.ValidationError("You can only upload up to 4 images.")

        return data
    