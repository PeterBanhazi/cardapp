from __future__ import absolute_import, unicode_literals

# This will make sure the app is always imported when
# Django starts so that shared tasks use this app.

# Import Celery app for autodiscover_tasks to work
from .celery import app as celery_app

__all__ = ('celery_app',)