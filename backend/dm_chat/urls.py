from django.urls import path
from .views import *

urlpatterns = [
    path('matched_users/', MatchedUsersListView.as_view(), name='matched-users-list'),
    path('chat/<str:room_name>/messages/', ChatMessageListView.as_view(), name='chat-messages'),
    path('chat-userdetail/<int:user_id>/', ChatUserDetailView.as_view(), name='chat-user-detail'),
    path('mark_read/<str:chat_room_id>/', MarkMessagesReadView.as_view(), name='mark-messages-read'),

]
