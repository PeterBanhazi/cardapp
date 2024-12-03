from django.db import models

# Create your models here.

class TennisPlayer(models.Model):
    """
    Model representing a professional tennis player with their abilities
    """
    name = models.CharField(max_length=100, unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    
    # Abilities with integer rating (0-100)
    serve = models.IntegerField(help_text="Serve ability rating (0-100)")
    forehand = models.IntegerField(help_text="Forehand ability rating (0-100)")
    backhand = models.IntegerField(help_text="Backhand ability rating (0-100)")
    volley = models.IntegerField(help_text="Volley ability rating (0-100)")
    stamina = models.IntegerField(help_text="Stamina ability rating (0-100)")
    agility = models.IntegerField(help_text="Agility ability rating (0-100)")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-serve']  # Optional: default ordering
        verbose_name_plural = "Tennis Players"