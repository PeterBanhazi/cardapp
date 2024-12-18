from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

#Default tennis players:
class TennisPlayer(models.Model):
    """
    Model representing a professional tennis player with their abilities
    """
    id = models.IntegerField(primary_key=True, unique=True, editable=False)
    username = models.CharField(User, max_length=255,null=True, blank=True)
    name = models.CharField(max_length=20, unique=True)
    avatar_url = models.CharField(max_length=255,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Abilities with integer rating (0-100)
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
        # Custom auto-increment logic and ability field validation 
        if not self.id:
            self.validate_total_points()
            max_id = TennisPlayer.objects.aggregate(models.Max('id'))['id__max']
            self.id = (max_id + 1) if max_id and max_id >= 10 else 11
        super().save(*args, **kwargs)



    def __str__(self):
        return f"{self.name} (Created by {self.username})"



#Users options and details
class UserProperties(models.Model):

    username = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    isonline = models.BooleanField(blank=True, null=True)
    friends = models.CharField(max_length=250)
    rankpoints = models.IntegerField(null=True, blank=True)
    customplayers = models.CharField(max_length=250)
    favoriteplayers = models.CharField(max_length=250)

    def __str__(self):
        return f"{self.rankpoints} (Created by {self.username})"
    
    class Meta:
        ordering = ['-username']  # Optional: default ordering
        verbose_name_plural = "UserProperties"




















#User created players

# class CustomTennisPlayer(models.Model):
#     """
#     Model to represent a custom tennis player created by a user
#     """

#     print("here")
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tennis_player')
#     name = models.CharField(max_length=20)
#     avatar_url = models.CharField(max_length=255)
    
#     # Ability fields with validators
#     serve = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
#     forehand = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
#     backhand = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
#     volley = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
#     stamina = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
#     agility = models.IntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(100)]
#     )
    
#     created_at = models.DateTimeField(auto_now_add=True)

#     def validate_total_points(self):
#         """
#         Validate that total ability points do not exceed 550
#         """
#         total_points = (
#             self.serve + self.forehand + self.backhand + 
#             self.volley + self.stamina + self.agility
#         )
#         if total_points > 550:
#             raise ValidationError("Total ability points cannot exceed 550")

#     def save(self, *args, **kwargs):
#         self.validate_total_points()
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.name} (Created by {self.user.username})"
