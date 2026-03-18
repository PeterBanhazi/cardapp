from django.apps import AppConfig


class FriendshipConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "friendship"
    verbose_name = "Friendship"

    def ready(self):
        import friendship.signals  # noqa: F401 — registers signal handlers
