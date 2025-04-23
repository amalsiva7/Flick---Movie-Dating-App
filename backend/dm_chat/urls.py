from django.urls import path
from .views import MatchedUsersListView

urlpatterns = [
    path('matched_users/', MatchedUsersListView.as_view(), name='matched-users-list'),
]
