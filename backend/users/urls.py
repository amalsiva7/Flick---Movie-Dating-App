from django.urls import path,include
from users.views import *

urlpatterns = [
    path('register/', CreateUserView.as_view(),name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('userlogin/', CreateLoginView.as_view(),name='login'),


]
