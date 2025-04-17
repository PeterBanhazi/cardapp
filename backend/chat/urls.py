from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('friends/status/', views.get_friends_status, name='friends-status'),
    path('messages/read/<int:friend_id>/', views.mark_messages_read, name='mark-messages-read'),
]
