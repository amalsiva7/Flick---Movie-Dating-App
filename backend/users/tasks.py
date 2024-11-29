from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import *
from django.urls import reverse

@shared_task
def send_email(user_id):
    user = Users.objects.get(id=user_id)
    verification, _ = Verification.objects.get_or_create(user=user)
    
    # Generate OTP and token
    otp = verification.generate_otp()
    token = verification.generate_verification_hash()

    #verification link
    verification_link = f"{settings.FRONTEND_BASE_URL}{reverse('verify')}?token={token}"

    subject = "Your Verification Details"
    message = (
        f"Your OTP code is {otp}. It will expire in 5 minutes.\n"
        f"Alternatively, click this link to verify: {verification_link}"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
