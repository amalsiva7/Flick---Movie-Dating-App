from django.urls import path
from .views import *

urlpatterns = [
    path('matched_users/', MatchedUsersListView.as_view(), name='matched-users-list'),
    path('chat/<str:room_name>/messages/', ChatMessageListView.as_view(), name='chat-messages'),
    path('chat-userimage/<int:user_id>/', ChatUserImageView.as_view(), name='chat-user-image'),
]
