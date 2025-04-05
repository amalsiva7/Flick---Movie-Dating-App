# api/serializers.py
from rest_framework import serializers
from .models import SubscriptionPlan

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'price', 'description', 'duration', 'is_active', 'is_paused', 'created_at']


# class UserSubscriptionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserSubscription
#         fields = '__all__'
