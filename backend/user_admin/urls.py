# user_admin/urls.py
from django.urls import path
from . import views

from .views import *


subscription_plan_list = SubscriptionPlanViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
urlpatterns = [
    path("user-count/",views.UserCount.as_view(),name='user-list'),
    path("users-list/", views.UserList.as_view(), name="user-list/"),
    path("user-status/<int:user_id>/", views.UserAccountStatus.as_view(), name="user-status/"),
    
    path('subscription-plans/', subscription_plan_list, name='subscription-plan-list-create'),

    path('subscription-plans/<int:pk>/pause/', SubscriptionPlanViewSet.as_view({'post': 'pause_plan'}), name='pause-subscription-plan'),
    path('subscription-plans/<int:pk>/unpause/', SubscriptionPlanViewSet.as_view({'post': 'unpause_plan'}), name='unpause-subscription-plan'),

    path('subscription-plans/<int:pk>/deactivate/', SubscriptionPlanViewSet.as_view({'post': 'deactivate_plan'}), name='deactivate-subscription-plan'),
    path('subscription-plans/<int:pk>/reactivate/', SubscriptionPlanViewSet.as_view({'post': 'reactivate_plan'}), name='reactivate-subscription-plan'),


    path('subscription-stats/', SubscriptionStatsAPI.as_view(), name='subscription-stats'),




]
