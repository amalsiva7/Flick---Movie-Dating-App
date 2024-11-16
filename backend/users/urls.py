from django.urls import path,include
from users.views import *

urlpatterns = [
    path('register/', CreateUserView.as_view(),name='register'),
    path('userlogin/', CreateLoginView.as_view(),name='login'),
]
