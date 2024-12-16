from django.db import models
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.shortcuts import get_object_or_404

# Models
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    location = models.CharField(max_length=100)
    interests = models.JSONField(default=list)  # Store as a list of strings
    gender_preferences = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female"), ("bi", "Bi")])

class UserImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="user_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

# Serializers
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['age', 'gender', 'location', 'interests', 'gender_preferences']

class UserImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserImage
        fields = ['id', 'image', 'uploaded_at']

# Views
class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Profile created successfully!"}, status=201)
        return Response(serializer.errors, status=400)

class SetUserImagesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if len(request.FILES) > 4:
            return Response({"error": "You can only upload up to 4 images."}, status=400)

        user_images = UserImage.objects.filter(user=request.user)
        if user_images.count() + len(request.FILES) > 4:
            return Response({"error": "Maximum of 4 images allowed per user."}, status=400)

        for image in request.FILES.values():
            UserImage.objects.create(user=request.user, image=image)

        return Response({"message": "Images uploaded successfully!"}, status=201)

    def get(self, request):
        images = UserImage.objects.filter(user=request.user)
        serializer = UserImageSerializer(images, many=True)
        return Response(serializer.data, status=200)




########################## PROFILE----RECOMMENDAION ############################

from math import radians, cos, sin, sqrt, atan2
from django.db.models import Q

def haversine(lat1, lon1, lat2, lon2):
    # Haversine formula to calculate distance
    R = 6371  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

class ProfileRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = get_object_or_404(Profile, user=request.user)
        user_location = user_profile.location
        user_preferences = user_profile.gender_preferences
        user_interests = set(user_profile.interests)

        # Filter by gender preferences
        gender_filter = Q(gender=user_preferences) if user_preferences != "bi" else Q()
        potential_matches = Profile.objects.filter(gender_filter).exclude(user=request.user)

        recommendations = []
        for profile in potential_matches:
            # Location-based filtering
            distance = haversine(
                user_location['lat'], user_location['lon'],
                profile.location['lat'], profile.location['lon']
            )
            if distance > 50:  # Example: Only show profiles within 50 km
                continue

            # Interests matching
            common_interests = len(user_interests.intersection(set(profile.interests)))

            # Append to recommendations
            recommendations.append({
                "profile_id": profile.id,
                "username": profile.user.username,
                "age": profile.age,
                "distance_km": round(distance, 2),
                "common_interests": common_interests,
            })

        # Sort by number of common interests, then by distance
        recommendations.sort(key=lambda x: (-x['common_interests'], x['distance_km']))

        return Response(recommendations, status=200)
