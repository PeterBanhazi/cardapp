from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth.models import User

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.decorators import login_required
import time
import json
from rest_framework.views import APIView
from rest_framework import viewsets

from .models import TennisPlayer,UserProperties, Friendship


from .serializer import TennisPlayerSerializer, UserPropertiesSerializer, TopListSerializer, FriendshipSerializer




# class AddTennisPlayerView(APIView):
#     def post(self, request):
#         serializer = TennisPlayerSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()  # The custom `save` handles the ID auto-increment
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TopListView(APIView):
    def get(self, request, *args, **kwargs):
        users = UserProperties.objects.all().order_by('-rankpoints')
        serializer = TopListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PlayerListView(APIView):
    def get(self, request):
        players = TennisPlayer.objects.all()
        serializer = TennisPlayerSerializer(players, many=True)
        return Response({
            'players': serializer.data
        })

class FriendshipViewSet(RetrieveUpdateAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(username=self.request.user).order_by('-created_at')

class UserPropertiesView(RetrieveUpdateAPIView):
    serializer_class = UserPropertiesSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Fetch the UserProperties for the current logged-in user."""
        user_properties, created = UserProperties.objects.get_or_create(username=self.request.user)
        return user_properties
    
    def update(self, request, *args, **kwargs):
    # partial=True esetén PATCH kérés, partial=False esetén PUT kérés
        partial = kwargs.pop('partial', True)
        print(request.data)
        # Lekérjük az aktuális termék példányt
        # instance = self.get_instance()
        instance = self.get_object()
        # Példa a részleges frissítés működésére
        print("Eredeti adatok:", instance.username, instance.isonline)
        time.sleep(2)
        print("Beérkező adatok:", request.data)
        print("Beérkező adatok:", request.data['current_player_id_change'])
        # Szerializáljuk az adatokat
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial  # Ha True, akkor csak a megadott mezők frissülnek
        )
        if 'isonline' in request.data:
            # Boolean mező módosítása
            instance.isonline = request.data['isonline']
        
        if 'current_player_id_change' in request.data:
            # ForeignKey mező módosítása
            print("probalnam modositani")
            try:
                try_current_player = TennisPlayer.objects.get(id=request.data['current_player_id_change'])
                instance.current_player = try_current_player
            except TennisPlayer.DoesNotExist:
                return Response(
                    {"error": "A megadott playa nem létezik"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def perform_update(self, serializer):
        # Itt lehet további műveleteket végezni mentés előtt
        serializer.save()

        
#User made Custom players: 

class AddTennisPlayerView(APIView):
    """
    ViewSet for creating and managing tennis players
    
    """
    permission_classes = [IsAuthenticated]
    queryset = TennisPlayer.objects.all()
    serializer_class = TennisPlayerSerializer


    def post(self, request):
        """
        Custom create method to handle tennis player creation
        """
        serializer = TennisPlayerSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the tennis player
            tennis_player = serializer.save(creator_username=self.request.user)
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
        '/api/post/add-player/',
        '/api/get/ranks/',
        '/api/options',
        '/api/get/friends',
        

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