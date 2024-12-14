import json
import uuid
import asyncio
import math
from datetime import datetime

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class MultiplayerConsumer(AsyncWebsocketConsumer):
    game_group_name = "game_group"
    username = "defaultusername" #testing
    players = {}
    dummymessage1 = {"type": "new_message", "payload": {"message": "testszoveg",}}
    dummymessage2 = {"type": "new_message", "payload": {"message": "meg1szoveg",}}
    dummymessage3 = {"type": "new_message", "payload": {"message": "meg2szoveg",}}
    dummymessage4 = {"type": "typing", "payload": {"isTyping": "meg2szoveg",}}

    update_lock = asyncio.Lock()

    async def connect(self):
        self.player_id = str(uuid.uuid4())
        await self.accept()

        await self.channel_layer.group_add(
            self.game_group_name, self.channel_name
        )

        await self.send(
            # text_data=json.dumps({"type": "playerId", "playerId": self.player_id})
            # text_data=json.dumps({"Wellcome to chat": ""})
            # text_data=json.dumps({"type": "playerId", "playerId": self.player_id, "cahannel_id": self.channel_name})
            text_data=json.dumps(self.dummymessage1)            
        )
        await self.send(text_data=json.dumps(self.dummymessage2))  
        await self.send(text_data=json.dumps(self.dummymessage3))   
        await self.send(text_data=json.dumps(self.dummymessage4))         

        async with self.update_lock:
            
            self.players[self.player_id] = {
                "id": self.player_id,
                "username": self.username,
                "cahannel_id": self.channel_name,
                "isTypeing": False,
                "isReady": False,
                "isSentMessage": False,
                "lastTenMessage": [],
                "messageText": "",

            }

        if len(self.players) == 1:
            asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        async with self.update_lock:
            if self.player_id in self.players:
                del self.players[self.player_id]

        await self.channel_layer.group_discard(
            self.game_group_name, self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        message_type = text_data_json.get("type", "")
        print(message_type)

        # player_id = text_data_json["playerId"]
        # self.messagetosend=text_data_json
        # self.now = datetime.now().strftime("%H:%M:%S")
        # player = self.players.get(player_id, None)
        # if not player:
        #     return

        # if message_type == "isTypeingNow":
        #     player["isTypeing"] = True
        # elif message_type == "isReadyClicked":
        #     player["isReady"] = True
        # elif message_type == "isSentMessage":
        #     player["messageText"] = text_data_json["messageText"]
            

        # self.groups
        # self.send(

        #     text_data=json.dumps({"at:": self.now, "mesage": self.messagetosend, "playerId": self.player_id})
        # )

    async def state_update(self, event):
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "stateUpdate",
                        "objects": event["objects"],
                    }
                )
            )

    async def game_loop(self):
            while len(self.players) > 0:
                async with self.update_lock:
                    for player in self.players.values():
                        if player["isTypeing"]:
                            await self.channel_layer.group_send(
                                self.game_group_name,
                                {"type": "state_update", "objects": list(self.players.values())}, 
                            )
                        if player["isSentMessage"]:
                            await self.channel_layer.group_send(
                                self.game_group_name,
                                {"type": "state_update", "objects": list(self.players.values())}, 
                            )
                            player["isSentMessage"] =False

                # await self.channel_layer.group_send(
                #     self.game_group_name,
                #     {"type": "state_update", "objects": list(self.players.values())},
                # )
                await asyncio.sleep(0.05)