from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Users

@shared_task
def send_otp_email(user_id):
    user = Users.objects.get(id=user_id)
    otp = user.generate_otp()  # Generate OTP and save it
    subject = "Your OTP Verification Code"
    message = f"Your OTP code is {otp}. It will expire in 1 minute."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
