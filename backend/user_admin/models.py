from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager

# Create your models here.

# models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class SubscriptionPlan(models.Model):
    DURATION_CHOICES = [
        ('3M', '3 Months'),
        ('6M', '6 Months'),
        ('1Y', '1 Year'),
    ]
    
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    duration = models.CharField(max_length=2, choices=DURATION_CHOICES)
    is_active = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        # Ensure maximum 3 active plans
        if self.is_active and not self.pk:
            active_count = SubscriptionPlan.objects.filter(is_active=True).count()
            if active_count >= 3:
                raise ValidationError("Cannot have more than 3 active plans")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

# class UserSubscription(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()
#     is_active = models.BooleanField(default=True)
#     razorpay_subscription_id = models.CharField(max_length=255)
    
#     class Meta:
#         constraints = [
#             models.UniqueConstraint(
#                 fields=['user'],
#                 condition=models.Q(is_active=True),
#                 name='unique_active_subscription_per_user'
#             )
#         ]
    
#     def __str__(self):
#         return f"{self.user.email} - {self.plan.name}"

