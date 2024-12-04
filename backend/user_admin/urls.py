# user_admin/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("user-count/",views.UserCount.as_view()),
    path("users-list/", views.UserList.as_view(), name="user-list/"),
]
