from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


from .models import TennisPlayer, UserProperties, Friendship, Profile


# Default list serializers for friend connections 
class FriendshipSerializer(serializers.ModelSerializer):
    friend_username = serializers.CharField(source='friend.username', read_only=True)

    class Meta:
        model = Friendship
        fields = ['friend_username', 'status', 'created_at']


#Default list serializers
class TopListSerializer(serializers.ModelSerializer):
    
    username = serializers.CharField(source='username.username')
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
        # Remove username from data as it's not a model field
        # username = data.pop('username')
        
        # Get user

        
        # try:
        #     usernametest= data['username']
        #     user = User.objects.get(username=username)
            
        #     self.get_token(username)
        #     token['username'] = user.username
            
            
        # except User.DoesNotExist:
        #     raise serializers.ValidationError("Invalid username")

        # Validate total points
        total_points = sum([
            data['serve'], data['forehand'], data['backhand'], 
            data['volley'], data['stamina'], data['agility']
        ])

        if total_points > 550:
            raise serializers.ValidationError("Total ability points cannot exceed 550")

        # Attach user to the validated data
        # data['username'] = user
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
    
    username = serializers.CharField(source='username.username')
    friendships = FriendshipSerializer(source='username.friendships', many=True, read_only=True)
    custom_players = TennisPlayerSerializer(source='username.custom_players', many=True, read_only=True)
    favorite_players = TennisPlayerSerializer(source='username.favorite_player_for_profile', many=True, read_only=False)
    favorite_player_id_change = serializers.IntegerField(write_only=True, required=False)
    current_player = TennisPlayerSerializer(read_only=True)
    current_player_id_change = serializers.PrimaryKeyRelatedField(
        queryset=TennisPlayer.objects.all(), source="current_player", write_only=True
    )
    ### TODO: only default+ custom = current
    class Meta:
        model = UserProperties
        fields = ['username','friendships','isonline','rankpoints','current_player_id_change','favorite_players','favorite_player_id_change','current_player','custom_players']

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
        token['email'] = user.email
        # ...
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user

class ProfileSerializer(serializers.ModelSerializer):
    user = RegisterSerializer(many=False, read_only=True)
    class Meta:
        model = Profile
        fields = ('username', 'first_name', 'last_name', 'email' ,'description', 'avatar_image')