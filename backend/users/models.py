from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager, PermissionsMixin
from django.utils import timezone
import random
import string

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

    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    objects = MyAccountManager()

    def generate_otp(self):
        otp = ''.join(random.choices(string.digits, k=6))
        self.otp = otp
        self.otp_created_at = timezone.now()
        self.save()
        return otp

    def is_otp_expired(self):
        return timezone.now() > self.otp_created_at + timezone.timedelta(minutes=1)

