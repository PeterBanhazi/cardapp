from django.apps import AppConfig


class FriendshipConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "user_relations"
    verbose_name = "UserRelationsForFriendship"

    def ready(self):
        import user_relations.signals  # noqa: F401 — registers signal handlers
