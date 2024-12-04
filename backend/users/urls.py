from django.urls import path,include
from users.views import *

urlpatterns = [
    path('register/', CreateUserView.as_view(),name='register'),
    path('verify/', VerificationView.as_view(), name='verify'),
    path('resend-otp/', ResendOtpView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(),name='login'),


]
