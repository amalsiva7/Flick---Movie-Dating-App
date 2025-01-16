from django.db import models
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from .models import *

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



############################## OLD DATECARD VIEW ##############################

class DatingCardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            current_user = request.user
            user_profile = current_user.profile
            
            # Current user's gender and preference
            user_gender = user_profile.gender
            user_preference = user_profile.gender_preferences

            # Base query filters
            base_filters = Q(
                is_active=True,
                is_email_verified=True,
                is_profile_updated=True,
                profile__isnull=False,
                images__isnull=False
            )

            # Match logic based on current user's gender and preference
            if user_preference == 'bi':
                # For bi users, show:
                # 1. Users who are interested in user's gender
                # 2. Users who are bi
                match_filter = (
                    Q(profile__gender_preferences=user_gender) |  # Users interested in current user's gender
                    Q(profile__gender_preferences='bi')  # Users who are bi
                )
            else:
                # For non-bi users, show:
                # 1. Users of preferred gender who are interested in user's gender
                # 2. Users of preferred gender who are bi
                match_filter = (
                    Q(profile__gender=user_preference) &  # Must match user's gender preference
                    (Q(profile__gender_preferences=user_gender) |  # And either interested in user's gender
                     Q(profile__gender_preferences='bi'))  # Or are bi
                )

            users = Users.objects.filter(
                base_filters
            ).filter(
                base_filters & match_filter
            ).exclude(
                id=current_user.id
            ).select_related('profile', 'images')

            serializer = DatingCardSerializer(users, many=True)
            print(f"POSSIBLE DATES for user {current_user} : {serializer.data}")
            return Response({'status': 'success', 'data': serializer.data})
        
        except Exception as e:
            print(f"Error in DatingCardView: {str(e)}")  # Debug print
            return Response({'status': 'error', 'message': str(e)}, status=500)



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






###################################Dating card serializer: ####################################

class DatingCardSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'age', 'interests', 'images']
        
    def get_age(self, obj):
        if hasattr(obj, 'profile') and obj.profile.birth_date:
            today = datetime.today()
            birth_date = obj.profile.birth_date
            return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return None
    
    def get_interests(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.interests
        return []
    
    def get_images(self, obj):
        if hasattr(obj, 'images'):
            images = []
            if obj.images.image1:
                images.append(obj.images.image1.url)
            if obj.images.image2:
                images.append(obj.images.image2.url)
            if obj.images.image3:
                images.append(obj.images.image3.url)
            if obj.images.image4:
                images.append(obj.images.image4.url)
            return images
        return []
    



######################################### Dating card veiw(Swipe Based):######################################

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import *
from .serializers import DatingCardSerializer
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance

class PotentialMatchesView(APIView):
    def get(self, request):
        # Get the current user
        current_user = request.user
        current_profile = current_user.profile
        
        # Get already seen profiles (you'll need to implement a SwipeHistory model)
        seen_profiles = SwipeHistory.objects.filter(
            user=current_user
        ).values_list('target_user_id', flat=True)
        
        # Base query for potential matches
        potential_matches = Users.objects.exclude(
            id__in=seen_profiles
        ).exclude(
            id=current_user.id
        ).filter(
            is_active=True,
            is_profile_updated=True
        )
        
        # Filter by gender preference
        if current_profile.gender_preferences != 'bi':
            potential_matches = potential_matches.filter(
                profile__gender=current_profile.gender_preferences
            )
        
        # Filter by location (assuming location is stored as lat/lng)
        user_location = Point(
            float(current_profile.location['longitude']), 
            float(current_profile.location['latitude'])
        )
        
        potential_matches = potential_matches.annotate(
            distance=Distance('profile__location', user_location)
        ).filter(
            distance__lte=D(km=50)  # Adjust radius as needed
        ).order_by('distance')
        
        # Get the next profile to show
        next_profile = potential_matches.first()
        
        if next_profile:
            serializer = DatingCardSerializer(next_profile)
            return Response(serializer.data)
        else:
            return Response(
                {"message": "No more profiles available"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class SwipeView(APIView):
    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        swipe_direction = request.data.get('direction')  # 'left' or 'right'
        
        # Record the swipe
        SwipeHistory.objects.create(
            user=request.user,
            target_user_id=target_user_id,
            direction=swipe_direction
        )
        
        # If it's a right swipe, check for a match
        if swipe_direction == 'right':
            # Check if the other user has already right-swiped on current user
            mutual_interest = SwipeHistory.objects.filter(
                user_id=target_user_id,
                target_user_id=request.user.id,
                direction='right'
            ).exists()
            
            if mutual_interest:
                # Create a match!
                Match.objects.create(
                    user1=request.user,
                    user2=Users.objects.get(id=target_user_id)
                )
                return Response({
                    "message": "It's a match!",
                    "matched": True
                })
        
        # Get next profile
        return self.get_next_profile(request)
    
    def get_next_profile(self, request):
        # Reuse the logic from PotentialMatchesView
        view = PotentialMatchesView()
        return view.get(request)

# Additional models needed:

class SwipeHistory(models.Model):
    user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='swipes')
    target_user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='received_swipes')
    direction = models.CharField(max_length=5, choices=[('left', 'Left'), ('right', 'Right')])
    created_at = models.DateTimeField(auto_now_add=True)

class Match(models.Model):
    user1 = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='matches_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)






########################################## Date card view(Message based)############################################:


# models.py
class Question(models.Model):
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class UserAnswer(models.Model):
    user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='answers')
    target_user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='received_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class NextProfileView(APIView):
    def get(self, request):
        # Get the current user
        current_user = request.user
        current_profile = current_user.profile
        
        # Get already answered profiles
        answered_profiles = UserAnswer.objects.filter(
            user=current_user
        ).values_list('target_user_id', flat=True)
        
        # Base query for potential matches
        potential_matches = Users.objects.exclude(
            id__in=answered_profiles
        ).exclude(
            id=current_user.id
        ).filter(
            is_active=True,
            is_profile_updated=True
        )
        
        # Apply filters (gender preference, location, etc.)
        if current_profile.gender_preferences != 'bi':
            potential_matches = potential_matches.filter(
                profile__gender=current_profile.gender_preferences
            )
        
        # Get next profile and random question
        next_profile = potential_matches.first()
        if next_profile:
            random_question = Question.objects.filter(
                is_active=True
            ).order_by('?').first()
            
            serializer = DatingCardSerializer(next_profile)
            return Response({
                'profile': serializer.data,
                'question': {
                    'id': random_question.id,
                    'text': random_question.text
                }
            })
        return Response(
            {"message": "No more profiles available"}, 
            status=status.HTTP_404_NOT_FOUND
        )

class AnswerQuestionView(APIView):
    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        question_id = request.data.get('question_id')
        answer = request.data.get('answer')
        
        if not all([target_user_id, question_id, answer]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Record the answer
        UserAnswer.objects.create(
            user=request.user,
            target_user_id=target_user_id,
            question_id=question_id,
            answer=answer
        )
        
        # Check for mutual interest
        mutual_answers = UserAnswer.objects.filter(
            user_id=target_user_id,
            target_user_id=request.user.id
        ).exists()
        
        if mutual_answers:
            # Create a match
            Match.objects.create(
                user1=request.user,
                user2=Users.objects.get(id=target_user_id)
            )
            return Response({
                "message": "It's a match!",
                "matched": True
            })
        
        # Get next profile
        return self.get_next_profile(request)
    
    def get_next_profile(self, request):
        view = NextProfileView()
        return view.get(request)

# urls.py
urlpatterns = [
    path('api/next-profile/', NextProfileView.as_view()),
    path('api/answer-question/', AnswerQuestionView.as_view()),
]