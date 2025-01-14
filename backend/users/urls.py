from django.urls import path,include
from users.views import *

urlpatterns = [
    path('register/', CreateUserView.as_view(),name='register'),
    path('verify/', VerificationView.as_view(), name='verify'),
    path('verify-magic-link/', VerificationMagicLinkView.as_view(), name='verify-magic-link'),
    path('resend-otp/', ResendOtpView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(),name='login'),


    path('user-profile/',ProfileView.as_view(),name='user-profile'),

    path('set-user-profile/',CreateProfileView.as_view(),name='set-user-profile'),
    path('update-user-profile/',UpdateProfileView.as_view(),name='update-user-profile'),

    path('set-user-pic/',SetProfilePicView.as_view(),name='set-user-pic'),
    path('update-user-pic/',UpdateProfilePicView.as_view(),name='update-user-pic'),

    path('dating-card/',DatingCardView.as_view(),name="cards"),
]