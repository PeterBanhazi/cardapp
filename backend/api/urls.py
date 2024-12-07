from django.urls import path, include
from . import views
from .views import PlayerListView
from rest_framework.routers import DefaultRouter
from .views import CustomTennisPlayerViewSet

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'post/createplayer', CustomTennisPlayerViewSet, basename='tennis-player')

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('test/', views.testEndPoint, name='test'),
    path('', views.getRoutes),
    path('get/playerlist/', PlayerListView.as_view(), name='player-list'),
    path('', include(router.urls)),    
]

