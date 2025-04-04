# user_admin/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("user-count/",views.UserCount.as_view(),name='user-list'),
    path("users-list/", views.UserList.as_view(), name="user-list/"),
    path("user-status/<int:user_id>/", views.UserAccountStatus.as_view(), name="user-status/"),
    
    

]
