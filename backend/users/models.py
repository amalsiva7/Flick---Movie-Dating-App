from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.timezone import now
from datetime import timedelta
import random
import string
import uuid
import hashlib
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

# Create your models here.

class MyAccountManager(BaseUserManager):
    def create_user(self,name,email,password=None):
        if not email:
            raise ValueError('user Must give an Email')
        
        user = self.model(
            email = self.normalize_email(email),
            name = name
        )
        user.set_password(password)
        user.is_active = True 
        user.save(using = self._db)
        return user
    
    def create_superuser(self,name,email,password=None):
        user = self.create_user(email = self.normalize_email(email),
                                name = name,
                                password=password)
        
        user.is_active = True
        user.is_superuser = True
        user.is_emailverified = True
        user.is_staff = True

        user.save(using = self._db)
        return user


##USER MODEL
class Users(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50)
    email = models.EmailField(max_length=100,unique=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_profile_updated = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    objects = MyAccountManager()

##VERIFICATION MODEL (otp,magiclink)
class Verification(models.Model):
    user = models.OneToOneField('Users',on_delete=models.CASCADE,related_name='verification')
    token = models.CharField(max_length=100)
    otp = models.CharField(max_length=6, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)


    def is_expired(self):
        expiry_time = self.created_at + timedelta(minutes=5)
        return now() > expiry_time
    
    def generate_verification_hash(self):
        """Generate a unique hash for verification."""
        data = f"{self.user.email}{self.otp}"
        hash_val = hashlib.sha256(data.encode()).hexdigest()
        self.token = hash_val
        self.save()
        return self.token
    
    def generate_otp(self, force=False):
        """Generate a 6-digit OTP only if it's not already set or forced."""
        if not self.otp or force:
            self.otp = str(random.randint(100000, 999999))
            self.created_at = now()
            self.save()
        return self.otp


##UserProfile model
class Profile(models.Model):
    user = models.OneToOneField('Users', on_delete=models.CASCADE, related_name="profile")
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")])
    location = models.JSONField(default=dict)  # Store latitude and longitude as a JSON object
    interests = models.JSONField(default=list)  # Store as a list of strings
    gender_preferences = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female"), ("bi", "Bi")])
    last_updated_at = models.DateTimeField(auto_now=True)


class UserImage(models.Model):
    user = models.OneToOneField('Users', on_delete=models.CASCADE, related_name="images")
    image1 = models.ImageField(upload_to="user_images/", null=True, blank=True)
    image2 = models.ImageField(upload_to="user_images/", null=True, blank=True)
    image3 = models.ImageField(upload_to="user_images/", null=True, blank=True)
    image4 = models.ImageField(upload_to="user_images/", null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """Custom validation to ensure that at least one image is uploaded."""
        if not any([self.image1, self.image2, self.image3, self.image4]):
            raise ValidationError("At least one profile picture must be uploaded.")
        

class ActionHistory(models.Model):
    user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='actions')
    target_user = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='received_flicks')
    action = models.CharField(max_length=20, choices=[('reject', 'Reject'), ('flick_message', 'Flick_Message')])
    created_at = models.DateTimeField(auto_now_add=True)

class Match(models.Model):
    user1 = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey('Users', on_delete=models.CASCADE, related_name='matches_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)



class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('flick', 'Flick Received'),
        ('match', 'New Match'),
        ('message', 'New Message'),
        ('unmatch', 'Unmatched'),
        ('system', 'System Notification'),
    ]

    recipient = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='notifications_received')
    sender = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='notifications_sent', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_match = models.ForeignKey('Match', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['is_read']),
        ]

    def mark_as_read(self):
        self.is_read = True
        self.save()


class FlickQuestion(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='asked_questions')
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=True) #tablewise default question
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_active']),
        ]

class FlickAnswer(models.Model):
    question = models.ForeignKey(FlickQuestion, on_delete=models.CASCADE, related_name='answers')
    responder = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='given_answers')
    answer_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['question', '-created_at']),
            models.Index(fields=['responder', '-created_at']),
        ]

