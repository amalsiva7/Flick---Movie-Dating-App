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

    path('potential-matches/',PotentialMatchesView.as_view(),name="potential-matches"),
    path('card-action/',ActionView.as_view(),name="card-action"),

    path('notifications/<int:user_id>/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:user_id>/mark-as-read/', MarkNotificationsAsRead.as_view(), name='mark-notifications-read'),

    path('flick-questions/', FlickQuestionView.as_view(), name='flick-questions'),
    path('questions/active/<int:user_id>/',ActiveQuestionView.as_view(),name='questions')
]