from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password,check_password
from django.contrib.auth import authenticate
from datetime import datetime
from .utils import *


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

    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    is_profile_updated = serializers.BooleanField(source='user.is_profile_updated', read_only=True)

    class Meta:
        model = Profile
        fields = ['username','email','birth_date', 'gender', 'location', 'interests', 'gender_preferences','is_profile_updated']

    def get_age(self, obj):
        today = datetime.today()
        return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))

    def validate_birth_date(self, value):
        today = datetime.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Must be 18+ to create a profile.")
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
    
    def update(self, instance, validated_data):
        # Update only the fields that were sent in the request
        for field_name, value in validated_data.items():
            setattr(instance, field_name, value)
        instance.save()
        return instance
    

class DatingCardSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    preferred_gender = serializers.SerializerMethodField()
    match_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'age','gender','preferred_gender', 'interests', 'images','match_percentage']

    
    def get_match_percentage(self, obj):
        request = self.context.get('request')
        if request and hasattr(obj, 'profile'):
            current_user_profile = request.user.profile
            return calculate_match_percentage(current_user_profile, obj.profile)
        return 0

    def get_gender(self,obj):
        # print("Getting gender of user :",obj.username)
        pass

        if hasattr(obj,'profile'):
            gender = obj.profile.gender
            # print(f"Gender of user: {obj.username} is {obj.profile.gender}")
            return gender
        
    def get_preferred_gender(self,obj):
        # print("Getting gender of user :",obj.username)
        pass

        if hasattr(obj,'profile'):
            preferred_gender = obj.profile.gender_preferences
            # print(f"Gender of user: {obj.username} is {obj.profile.gender_preferences}")
            return preferred_gender
        
    def get_age(self, obj):
        # print(f"Calculating age for user: {obj.username}")  # Debug print
        if hasattr(obj, 'profile') and obj.profile.birth_date:
            today = datetime.today()
            birth_date = obj.profile.birth_date
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )
            # print(f"Calculated age: {age}")  # Debug print
            return age
        return None
    
    def get_interests(self, obj):
        # print(f"Getting interests for user: {obj.username}")  # Debug print
        if hasattr(obj, 'profile'):
            interests = obj.profile.interests
            # print(f"Found interests: {interests}")  # Debug print
            return interests
        return []
    
    def get_images(self, obj):
        # print(f"Getting images for user: {obj.username}")  # Debug print
        if hasattr(obj, 'images'):
            images = []
            for i in range(1, 5):
                image = getattr(obj.images, f'image{i}')
                if image:
                    images.append(image.url)
            # print(f"Found images: {images}")  # Debug print
            return images
        return []


class FlickQuestionSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None
    
    class Meta:
        model = FlickQuestion
        fields = ['id', 'username', 'question_text', 'created_at', 'is_active']
        read_only_fields = ['id', 'username', 'created_at']
    
    def create(self, validated_data):
        return FlickQuestion.objects.create(**validated_data)


