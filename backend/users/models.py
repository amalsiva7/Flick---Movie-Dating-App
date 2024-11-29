from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.timezone import now
from datetime import timedelta
import random
import string
import uuid
import hashlib

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



class Users(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=100,unique=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    objects = MyAccountManager()

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
    
    def generate_otp(self):
        """Generate a 6-digit OTP and save it."""
        self.otp = str(random.randint(100000, 999999))
        self.save()
        return self.otp