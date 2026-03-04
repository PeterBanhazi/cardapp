import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuthStore } from '../core/store/useAuthStore';

interface PlayerAbilities {
    serve: number;
    forehand: number;
    backhand: number;
    volley: number;
    stamina: number;
    agility: number;
}

interface Player extends PlayerAbilities {
    name: string;
    avatar_url: string;
}

interface PlayerCardProps {
    player: Player;
}

interface ApiResponse {
    players: Player[];
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    const { name, avatar_url } = player;

    const abilities: PlayerAbilities = {
        serve: player.serve,
        forehand: player.forehand,
        backhand: player.backhand,
        volley: player.volley,
        stamina: player.stamina,
        agility: player.agility,
    };

    const handleFavoriteClick = (): void => {
        return;
    };

    const handlePlayClick = (): void => {
        return;
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2 w-64">
            <div className="flex items-center mb-4">
                <img
                    src={avatar_url}
                    alt={`${name} avatar`}
                    className="w-16 h-16 rounded-full mr-4"
                />
                <h2 className="text-xl font-bold">{name}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(abilities).map(([skill, value]) => (
                    <div key={skill} className="bg-gray-100 p-2 rounded">
                        <p className="text-sm capitalize">{skill}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${value}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-right">{value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 pt-2 gap-2">
                <button
                    id="Favorite"
                    className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleFavoriteClick}
                >
                    Favorite
                </button>
                <button
                    className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    id="Play"
                    onClick={handlePlayClick}
                >
                    Play
                </button>
            </div>
        </div>
    );
};

const TennisPlayersList: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlayers = async (): Promise<void> => {
            try {
                setIsLoading(true);
                const response =
                    await axios.get<ApiResponse>('/get/playerlist/');
                setPlayers(response.data.players);
                setIsLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'An error occurred'
                );
                setIsLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading players...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>Error fetching players: {error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center">Tennis Players</h1>
            <div className="flex flex-wrap justify-center">
                {players.map((player, index) => (
                    <PlayerCard key={index} player={player} />
                ))}
            </div>
        </div>
    );
};

export default TennisPlayersList;
