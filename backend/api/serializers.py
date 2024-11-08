from rest_framework import serializers
from .models import Users


class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)  # Add confirm_password as a write-only field
    class Meta:
        model = Users
        field = ['id','name','email','password','confirm_password']
        extra_kwargs = {'password':{'write_only':True}}

    def validate(self, data):
        # Check if password and confirm_password match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return data
    
    def create(self, validated_data):
        user = Users.objects.create_user(**validated_data)
        return user