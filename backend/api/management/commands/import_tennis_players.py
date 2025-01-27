import json
from django.core.management.base import BaseCommand
from django.conf import settings
import os

from api.models import *

class Command(BaseCommand):
    help = 'Import tennis players from JSON file'

    def handle(self, *args, **kwargs):
        # Construct the full path to the JSON file
        json_path = os.path.join(settings.BASE_DIR, 'tennis-players-data.json')
        
        try:
            # Read the JSON file
            with open(json_path, 'r') as file:
                data = json.load(file)
            
            # Clear existing players to avoid duplicates
            TennisPlayer.objects.all().delete()
            
            # Import new players
            for player_data in data['players']:
                TennisPlayer.objects.create(
                    id=player_data['id'],
                    # user=player_data['username'],
                    name=player_data['name'],
                    avatar_url=player_data['avatarUrl'],
                    serve=player_data['abilities']['serve'],
                    forehand=player_data['abilities']['forehand'],
                    backhand=player_data['abilities']['backhand'],
                    volley=player_data['abilities']['volley'],
                    stamina=player_data['abilities']['stamina'],
                    agility=player_data['abilities']['agility']
                )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(data["players"])} tennis players'))
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing tennis players: {str(e)}'))