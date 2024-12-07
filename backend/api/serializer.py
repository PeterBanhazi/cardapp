from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import TennisPlayer
from .models import CustomTennisPlayer

#Default player serialisers

class TennisPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TennisPlayer
        fields = ['id', 'user', 'name', 'avatar_url', 'serve', 'forehand', 'backhand', 'volley', 'stamina', 'agility']

# class TennisPlayerAbilitiesSerializer(serializers.Serializer):
#     serve = serializers.IntegerField()
#     forehand = serializers.IntegerField()
#     backhand = serializers.IntegerField()
#     volley = serializers.IntegerField()
#     stamina = serializers.IntegerField()
#     agility = serializers.IntegerField()

# class TennisPlayerSerializer(serializers.ModelSerializer):
#     abilities = serializers.SerializerMethodField()
#     avatarUrl = serializers.CharField(source='avatar_url')

#     class Meta:
#         model = TennisPlayer
#         fields = ['id','name', 'avatarUrl', 'abilities']

#     def get_abilities(self, obj):
#         return {
#             'serve': obj.serve,
#             'forehand': obj.forehand,
#             'backhand': obj.backhand,
#             'volley': obj.volley,
#             'stamina': obj.stamina,
#             'agility': obj.agility
#         }

# Usermade custom player serializer

class CustomTennisPlayerSerializer(serializers.ModelSerializer):
    print("here")
    username = serializers.CharField(write_only=True)
    print("here")

    class Meta:
        model = CustomTennisPlayer
        fields = [
            'username', 'name', 'avatar_url', 
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
        username = data.pop('username')
        
        # Get user
        try:
            user = User.objects.get(username=username)
            
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username")

        # Validate total points
        total_points = sum([
            data['serve'], data['forehand'], data['backhand'], 
            data['volley'], data['stamina'], data['agility']
        ])

        if total_points > 550:
            raise serializers.ValidationError("Total ability points cannot exceed 550")

        # Attach user to the validated data
        data['user'] = user
        return data

    def create(self, validated_data):
        """
        Create and return a new TennisPlayer instance
        """
        # Remove user from validated_data before creating the player
        user = validated_data.pop('user')
        tennis_player = CustomTennisPlayer.objects.create(user=user, **validated_data)
        return tennis_player


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