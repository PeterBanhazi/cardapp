from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import TennisPlayer, UserProperties, Friendship, UserProfile
from .models import AVATAR_CHOICES

from django.contrib.auth import get_user_model
User = get_user_model()


# Default list serializers for friend connections 
class FriendshipSerializer(serializers.ModelSerializer):
    friend_username = serializers.CharField(source='friend.username', read_only=True)

    class Meta:
        model = Friendship
        fields = ['friend_username', 'status', 'created_at']


#Default list serializers
class TopListSerializer(serializers.ModelSerializer):
    
    username = serializers.CharField(source='user.username')
    class Meta:
        model = UserProperties
        fields = ['username', 'rankpoints']
        
# Usermade custom player serializer

class TennisPlayerSerializer(serializers.ModelSerializer): 
    class Meta:
        model = TennisPlayer
        fields = [
            'id','creator_username', 'name', 'avatar_url', 
            'serve', 'forehand', 'backhand', 
            'volley', 'stamina', 'agility'
        ]

    def validate_name(self, value):
        """
        Validate that player name is not more than 20 characters
        """
        if len(value) > 20:
            raise serializers.ValidationError("Player name must be 20 characters or less")
        return value

    def validate(self, data):
        """
        Custom validation to check total ability points and username
        """
         # Validate total points
        total_points = sum([
            data['serve'], data['forehand'], data['backhand'], 
            data['volley'], data['stamina'], data['agility']
        ])

        if total_points > 550:
            raise serializers.ValidationError("Total ability points cannot exceed 550")

        return data

    def create(self, validated_data):
        """
        Create and return a new TennisPlayer instance
        """
        # Remove user from validated_data before creating the player
        # user = validated_data.pop('user')
        tennis_player = TennisPlayer.objects.create( **validated_data)
        return tennis_player


class UserPropertiesSerializer(serializers.ModelSerializer):
    
    username = serializers.CharField(source='user.username')
    friendships = FriendshipSerializer(source='user.friendships', many=True, read_only=True)
    custom_players = TennisPlayerSerializer(source='user.custom_players', many=True, read_only=True)
    favorite_players = TennisPlayerSerializer(source='user.favorite_player_for_profile', many=True, read_only=False)
    favorite_player_id_change = serializers.IntegerField(write_only=True, required=False)
    current_player = TennisPlayerSerializer(read_only=True)
    current_player_id_change = serializers.PrimaryKeyRelatedField(
        queryset=TennisPlayer.objects.all(), source="current_player", write_only=True
    )
    
    class Meta:
        model = UserProperties
        fields = ['username','friendships','rankpoints','current_player_id_change','favorite_players','favorite_player_id_change','current_player','custom_players']

        def update(self, instance, validated_data):
            user = instance.username
            favorite_player_id = validated_data.pop("favorite_player_id_change", None)

            if favorite_player_id is not None:
                try:
                    favorite_player = TennisPlayer.objects.get(id=favorite_player_id)
                except TennisPlayer.DoesNotExist:
                    raise serializers.ValidationError({"error": "Given player not exits."})

                # **Validáció**: Csak az 1–10 ID közötti vagy a user által létrehozott játékos lehet kedvenc
                if favorite_player.creator_username is not None and favorite_player.creator_username != user:
                    raise serializers.ValidationError({"error": "Invalid Id given."})

                # Ha a játékos már benne van a kedvencek között → eltávolítás
                if user.favorite_player_for_profile.filter(id=favorite_player_id).exists():
                    user.favorite_player_for_profile.remove(favorite_player)
                else:
                    user.favorite_player_for_profile.add(favorite_player)

            return super().update(instance, validated_data)

#user auth classes

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        # token['email'] = user.email
        # ...
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')
        extra_kwargs = {
            'username': {
                'min_length': 4,
                'max_length': 20,
                'error_messages': {
                    'min_length': 'Username must be at least 4 characters!',
                    'max_length': 'Username cant be longer than 20 characters!',
                }
            }
        }

    def validate(self, attrs):        
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        if not attrs['email']:
            raise serializers.ValidationError(
                {"Email": "Not valid email"}) 
        if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError("Email is already registered!")                  

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )
        user.email = validated_data['email']
        user.set_password(validated_data['password'])
        user.save()

        return user
            

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model with nested user serialization
    """
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    
    class Meta:
        model = UserProfile
        fields = [
            'user_id',
            'username', 
            'first_name', 
            'last_name', 
            'description', 
            'avatar_image', 
            'birthday'
        ]
    
    def update(self, instance, validated_data):
        """
        Custom update method to handle user model updates
        """
        # Extract user data if present
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update user first and last name if provided
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    def validate_avatar_image(self, value):
        """
        Validate that the avatar is from the predefined choices
        """
        valid_avatars = [choice[0] for choice in AVATAR_CHOICES]
        if value not in valid_avatars:
            raise serializers.ValidationError("Invalid avatar image selection.")
        return value
    

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("A jelenlegi jelszó nem megfelelő.")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "A jelszavak nem egyeznek."})
        
        # Ellenőrizzük a jelszó erősségét a Django beépített validátorával
        user = self.context['request'].user
        validate_password(data['new_password'], user)
        
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()