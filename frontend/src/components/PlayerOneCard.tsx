import TennisPlayerCards from "./TennisPlayerCards";
import React from "react";


interface PlayerAbilities {
    serve: number;
    forehand: number;
    backhand: number;
    volley: number;
    stamina: number;
    agility: number;
  }
  
  interface Player {
    name: string;
    avatarUrl: string;
    abilities: PlayerAbilities;
  
  }

const PlayerOneCard: React.FC<{ players: Player[] }> = ({ players }) => {
    return (
        <TennisPlayerCards  players={players.filter((player) => player.name==="Hubert Hurkacz")}/>
    )

}

export default PlayerOneCard;