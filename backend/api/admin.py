from django.contrib import admin

# Register your models here.
from .models import TennisPlayer
from .models import CustomTennisPlayer

@admin.register(TennisPlayer)
class TennisPlayerAdmin(admin.ModelAdmin):
    """
    Admin configuration for TennisPlayer model
    """
    list_display = ('name', 'serve', 'forehand', 'backhand', 'volley', 'stamina', 'agility')
    search_fields = ('name',)
    list_filter = ('serve', 'forehand', 'backhand')

    # Optional: customize how the model is displayed in admin
    fieldsets = (
        ('Player Information', {
            'fields': ('name', 'avatar_url')
        }),
        ('Player Abilities', {
            'fields': ('serve', 'forehand', 'backhand', 'volley', 'stamina', 'agility')
        })
    )

@admin.register(CustomTennisPlayer)
class CustomTennisPlayerAdmin(admin.ModelAdmin):
    """
    Admin configuration for TennisPlayer model
    """
    list_display = ('user', 'created_at','name', 'serve', 'forehand', 'backhand', 'volley', 'stamina', 'agility')
    search_fields = ('name','user', 'created_at')
    list_filter = ('serve', 'forehand', 'backhand')

    # Optional: customize how the model is displayed in admin
    fieldsets = (
        ('CustomPlayer Information', {
            'fields': ('user', 'created_at','name', 'avatar_url')
        }),
        ('Custom Player Abilities', {
            'fields': ('serve', 'forehand', 'backhand', 'volley', 'stamina', 'agility')
        })
    )