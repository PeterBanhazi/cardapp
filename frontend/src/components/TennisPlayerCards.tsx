import React from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from './ui/card';

// interface PlayerAbilities {
//     serve: number;
//     forehand: number;
//     backhand: number;
//     volley: number;
//     stamina: number;
//     agility: number;
// }
interface PlayerStats {
    id: number;
    creator_username: number | string | null;
    name: string;
    avatar_url: string;
    serve: number;
    forehand: number;
    backhand: number;
    volley: number;
    stamina: number;
    agility: number;
}

const TennisPlayerCards: React.FC<{ players: PlayerStats[] }> = ({
    players,
}) => {
    return (
        <div className="flex flex-wrap gap-1 mx-auto p-2">
            {players.map((player) => (
                <Card
                    key={player.name}
                    className="flex flex-col w-[144px] h-[316px] bg-slate-800 text-slate-100 border-1 ring-2 ring-inset ring-gray-400"
                >
                    <CardHeader className="space-y-1.5 p-2">
                        <img
                            src={player.avatar_url}
                            alt={player.name}
                            className="w-20 h-20 rounded-full mx-auto"
                        />
                    </CardHeader>
                    <div className="flex flex-col justify-between">
                        <CardContent className="p-1 pl-2">
                            <CardTitle className="mb-1 flex justify-center">
                                {player.name}
                            </CardTitle>
                            <div className="flex-col pl-2">
                                <div>Serve: {player.serve}</div>
                                <div>Forehand: {player.forehand}</div>
                                <div>Backhand: {player.backhand}</div>
                                <div>Volley: {player.volley}</div>
                                <div>Stamina: {player.stamina}</div>
                                <div>Agility: {player.agility}</div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 flex justify-center">
                            <button className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-1 px-3 rounded m-1">
                                Add
                            </button>
                            <button className="bg-orange-700 hover:bg-orange-500 text-white font-bold py-1 px-3 rounded m-1 ">
                                Play
                            </button>
                        </CardFooter>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default TennisPlayerCards;
