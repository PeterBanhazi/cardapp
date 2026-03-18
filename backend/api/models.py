from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.forms import ValidationError
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your models here.

#Default tennis players:
class TennisPlayer(models.Model):
    """
    Model representing a professional tennis player with their abilities
    """
    id = models.IntegerField(primary_key=True, unique=True, editable=False)
    # TODO: remove null and blank options
    creator_username = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_players')
    name = models.CharField(max_length=20, unique=True)
    avatar_url = models.CharField(max_length=255,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    favorite_player = models.ManyToManyField(User, related_name='favorite_player_for_profile')
    
    
    
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
        return f"{self.name} (Created by {self.creator_username})"


#Users options and details
class UserProperties(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userproperties')
    isonline = models.BooleanField(blank=True, null=False, default=False)
    current_player = models.ForeignKey(TennisPlayer, on_delete=models.SET_DEFAULT, default=1, related_name='current_player_for_profile')
    rankpoints = models.IntegerField(null=False, blank=True, default=0)
    


    def __str__(self):
        return f"{self.rankpoints} (Created by {self.user.username})"
    
    class Meta:
        ordering = ['-user']  # Optional: default ordering
        verbose_name_plural = "UserProperties"


#List for friend connection persistence 
class Friendship(models.Model):
    username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_of')
    status = models.CharField(
        max_length=20, 
        choices=[
            ('PENDING', 'Request sent'), 
            ('ACCEPTED', 'Friendship accepted'), 
            ('BLOCKED', 'Blocked')
        ],
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username.username} - {self.friend.username}"
    
    class Meta:
        ordering = ['-created_at'] 
        
AVATAR_CHOICES = [
    ('user1.png', 'Avatar 1'),
    ('user2.png', 'Avatar 2'),
    ('user3.png', 'Avatar 3'),
    ('user4.png', 'Avatar 4'),
    ('user5.png', 'Avatar 5'),
    ('user6.png', 'Avatar 6'),
    ('user7.png', 'Avatar 7'),
    ('user8.png', 'Avatar 8'),
    ('user9.png', 'Avatar 9'),
    ('user10.png', 'Avatar 10'),
]
        
class UserProfile(models.Model):
    """
    Extended user profile with additional information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    description = models.CharField(max_length=500, blank=True, null=True)
    avatar_image = models.CharField(
        max_length=20, 
        choices=AVATAR_CHOICES, 
        default=AVATAR_CHOICES[0][0]
    )
    birthday = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a profile when a new user is created
    """
    if created:
        UserProfile.objects.create(user=instance)
        UserProperties.objects.create(user=instance)
