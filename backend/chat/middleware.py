from django.utils import timezone
from .models import UserStatus

class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if user attribute exists and user is authenticated
        if hasattr(request, 'user') and request.user and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated:
            # Update user's last activity timestamp
            UserStatus.objects.update_or_create(
                user=request.user,
                defaults={'last_activity': timezone.now()}
            )
        
        response = self.get_response(request)
        return response