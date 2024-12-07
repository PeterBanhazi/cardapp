from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

#Default tennis players:
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

#User created players

class CustomTennisPlayer(models.Model):
    """
    Model to represent a custom tennis player created by a user
    """

    print("here")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tennis_player')
    name = models.CharField(max_length=20)
    avatar_url = models.CharField(max_length=255)
    
    # Ability fields with validators
    serve = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    forehand = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    backhand = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    volley = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    stamina = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    agility = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def validate_total_points(self):
        """
        Validate that total ability points do not exceed 550
        """
        total_points = (
            self.serve + self.forehand + self.backhand + 
            self.volley + self.stamina + self.agility
        )
        if total_points > 550:
            raise ValidationError("Total ability points cannot exceed 550")

    def save(self, *args, **kwargs):
        self.validate_total_points()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (Created by {self.user.username})"
