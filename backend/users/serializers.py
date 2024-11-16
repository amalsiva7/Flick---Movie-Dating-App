from rest_framework import serializers
from .models import Users
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True) 
    class Meta:
        model = Users
        fields = ['id','name','email','password','confirm_password']
        extra_kwargs = {'password':{'write_only':True}}

    def validate(self, data):
        # Check if password and confirm_password match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data["password"] = make_password(validated_data.get("password"))

        
        return super().create(validated_data)

