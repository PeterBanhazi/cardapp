from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import json

from rest_framework.views import APIView

from .models import TennisPlayer
from .serializer import TennisPlayerSerializer

from rest_framework import viewsets

# class AddTennisPlayerView(APIView):
#     def post(self, request):
#         serializer = TennisPlayerSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()  # The custom `save` handles the ID auto-increment
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlayerListView(APIView):
    def get(self, request):
        players = TennisPlayer.objects.all()
        serializer = TennisPlayerSerializer(players, many=True)
        return Response({
            'players': serializer.data
        })

#User made Custom players: 
        


class AddTennisPlayerView(APIView):
    """
    ViewSet for creating and managing tennis players
    
    """
    # queryset = TennisPlayer.objects.all()
    serializer_class = TennisPlayerSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Custom create method to handle tennis player creation
        """
        serializer = TennisPlayerSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the tennis player
            tennis_player = serializer.save()
            return Response(
                {
                    'message': 'Tennis player created successfully', 
                    'player_id': tennis_player.id
                }, 
                status=status.HTTP_201_CREATED
            )
        
        # Return validation errors if any
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )
# Create your views here.

# @api_view(['GET'])
# def getPlayerList(request):
#     return 

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/test/',
        '/api/get/playerlist',
        '/api/post/createplayer',

    ]
    return Response(routes)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        try:
            body = request.body.decode('utf-8')
            data = json.loads(body)
            if 'text' not in data:
                return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)
            text = data.get('text')
            data = f'Congratulation your API just responded to POST request with text: {text}'
            return Response({'response': data}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)
    return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)