import React from "react";
import {PlayerCard} from "./PlayerCard";
// import playerTopList from "../assets/tennis-players-data.json";

// interface Player {
//   name: string;
//   avatarUrl: string;
//   abilities: {
//     serve: number;
//     forehand: number;
//     backhand: number;
//     volley: number;
//     stamina: number;
//     agility: number;
//   };
// }

// interface ListPlayerCardsProps {
//   players: Player[];
// }

interface myFirstProps {
  name: string,
}
const playerTopList = {
    "players": [
      {
        "name": "Novak Djokovic",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 95,
          "forehand": 98,
          "backhand": 99,
          "volley": 92,
          "stamina": 97,
          "agility": 96
        }
      },
      {
        "name": "Carlos Alcaraz",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 88,
          "forehand": 95,
          "backhand": 90,
          "volley": 89,
          "stamina": 94,
          "agility": 98
        }
      },
      {
        "name": "Jannik Sinner",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 87,
          "forehand": 94,
          "backhand": 93,
          "volley": 85,
          "stamina": 92,
          "agility": 93
        }
      },
      {
        "name": "Daniil Medvedev",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 89,
          "forehand": 88,
          "backhand": 92,
          "volley": 84,
          "stamina": 95,
          "agility": 90
        }
      },
      {
        "name": "Andrey Rublev",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 86,
          "forehand": 92,
          "backhand": 85,
          "volley": 82,
          "stamina": 88,
          "agility": 87
        }
      },
      {
        "name": "Alexander Zverev",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 92,
          "forehand": 89,
          "backhand": 88,
          "volley": 83,
          "stamina": 90,
          "agility": 88
        }
      },
      {
        "name": "Holger Rune",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 85,
          "forehand": 88,
          "backhand": 86,
          "volley": 82,
          "stamina": 87,
          "agility": 91
        }
      },
      {
        "name": "Hubert Hurkacz",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 93,
          "forehand": 87,
          "backhand": 84,
          "volley": 86,
          "stamina": 85,
          "agility": 84
        }
      },
      {
        "name": "Alex de Minaur",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 83,
          "forehand": 85,
          "backhand": 86,
          "volley": 84,
          "stamina": 93,
          "agility": 96
        }
      },
      {
        "name": "Stefanos Tsitsipas",
        "avatarUrl": "/api/placeholder/150/150",
        "abilities": {
          "serve": 90,
          "forehand": 93,
          "backhand": 85,
          "volley": 87,
          "stamina": 89,
          "agility": 88
        }
      }
    ]
  }



export const ListPlayerCards: React.FC<myFirstProps> = (props) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* <PlayerCard /> */}



      {/* {players.map((player) => (
        <PlayerCard
          key={player.name}
          name={player.name}
          avatarUrl={player.avatarUrl}
          abilities={player.abilities}
        />
      ))} */}
    </div>
        
    );
}