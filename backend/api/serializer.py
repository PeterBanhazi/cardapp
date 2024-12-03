from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import TennisPlayer

#playerlist serialisers

class TennisPlayerAbilitiesSerializer(serializers.Serializer):
    serve = serializers.IntegerField()
    forehand = serializers.IntegerField()
    backhand = serializers.IntegerField()
    volley = serializers.IntegerField()
    stamina = serializers.IntegerField()
    agility = serializers.IntegerField()

class TennisPlayerSerializer(serializers.ModelSerializer):
    abilities = serializers.SerializerMethodField()
    avatarUrl = serializers.CharField(source='avatar_url')

    class Meta:
        model = TennisPlayer
        fields = ['name', 'avatarUrl', 'abilities']

    def get_abilities(self, obj):
        return {
            'serve': obj.serve,
            'forehand': obj.forehand,
            'backhand': obj.backhand,
            'volley': obj.volley,
            'stamina': obj.stamina,
            'agility': obj.agility
        }



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