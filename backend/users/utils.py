# utils.py
from datetime import timedelta
from django.utils import timezone
from django.utils.timezone import now
from math import radians, sin, cos, sqrt, atan2
from .models import *

def format_time_difference(last_updated_at):
    now_time = now()
    diff = now_time - last_updated_at

    if diff < timedelta(minutes=1):
        return "moments ago"
    elif diff < timedelta(hours=1):
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif diff < timedelta(days=1):
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff < timedelta(days=30):
        days = diff.days
        return f"{days} day{'s' if days > 1 else ''} ago"
    elif diff < timedelta(days=365):
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    else:
        years = diff.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"

def calculate_match_percentage(user1_profile, user2_profile):
    score = 0
    total_factors = 4  # We'll consider 4 factors
    
    # 1. Shared interests (50% of total score)
    user1_interests = set(user1_profile.interests)
    user2_interests = set(user2_profile.interests)
    shared_interests = user1_interests.intersection(user2_interests)
    total_interests = user1_interests.union(user2_interests)
    
    if total_interests:
        interest_score = len(shared_interests) / len(total_interests)
        score += (interest_score * 0.5)  # 50% weight for interests
    
    # 2. Age compatibility (20% of total score)
    age1 = (timezone.now().date() - user1_profile.birth_date).days // 365
    age2 = (timezone.now().date() - user2_profile.birth_date).days // 365
    age_diff = abs(age1 - age2)
    
    if age_diff <= 5:
        age_score = 1.0
    elif age_diff <= 10:
        age_score = 0.7
    elif age_diff <= 15:
        age_score = 0.4
    else:
        age_score = 0.2
    
    score += (age_score * 0.2)  # 20% weight for age
    
    # 3. Location proximity (20% of total score)
    try:
        lat1, lon1 = user1_profile.location.get('latitude'), user1_profile.location.get('longitude')
        lat2, lon2 = user2_profile.location.get('latitude'), user2_profile.location.get('longitude')
        
        if all([lat1, lon1, lat2, lon2]):
            from math import radians, sin, cos, sqrt, atan2
            
            R = 6371  # Earth's radius in kilometers
            
            lat1, lon1 = map(radians, [float(lat1), float(lon1)])
            lat2, lon2 = map(radians, [float(lat2), float(lon2)])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            distance = R * c
            
            # Score based on distance
            if distance <= 5:
                location_score = 1.0
            elif distance <= 20:
                location_score = 0.8
            elif distance <= 50:
                location_score = 0.6
            elif distance <= 100:
                location_score = 0.4
            else:
                location_score = 0.2
                
            score += (location_score * 0.2)  # 20% weight for location
    except:
        # If location calculation fails, don't add any score
        pass
    
    # 4. Gender preference compatibility (10% of total score)
    if user1_profile.gender_preferences == 'bi' or user2_profile.gender_preferences == 'bi':
        score += 0.1  # Full compatibility score
    elif (user1_profile.gender_preferences == user2_profile.gender and 
          user2_profile.gender_preferences == user1_profile.gender):
        score += 0.1  # Full compatibility score
    
    # Convert to percentage and round to 2 decimal places
    return round(score * 100, 2)



# utils.py (or wherever appropriate)
from dm_chat.models import ChatRoom
from django.shortcuts import get_object_or_404

def get_or_create_chatroom(user, target_user_id):
    target_user = get_object_or_404(Users, id=target_user_id)

    # Sort users to ensure consistent room names
    sorted_ids = sorted([user.id, target_user.id])
    room_name = f"chat_{sorted_ids[0]}_{sorted_ids[1]}"

    # Create or fetch chatroom
    chatroom, created = ChatRoom.objects.get_or_create(
        name=room_name,
        defaults={
            "user1": user if user.id == sorted_ids[0] else target_user,
            "user2": target_user if user.id == sorted_ids[0] else user
        }
    )

    return chatroom
