from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import PlayerListView
from .views import AddTennisPlayerView
from .views import UserPropertiesView
from .views import TopListView
from .views import FriendshipViewSet
from .views import UserProfileView
from .views import PasswordChangeView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('password/', PasswordChangeView.as_view(), name='password-change'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('test/', views.testEndPoint, name='test'),
    path('', views.getRoutes),
    path('get/playerlist/', PlayerListView.as_view(), name='player-list'),
    path('', include(router.urls)),
    path('add-player/', AddTennisPlayerView.as_view(), name='add-player'),
    path('options/', UserPropertiesView.as_view(), name='options'),
    path('ranks/', TopListView.as_view(), name='ranks'),
    path('get/friends/', FriendshipViewSet.as_view(), name='friends'),
]

