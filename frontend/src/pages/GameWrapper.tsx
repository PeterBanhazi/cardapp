import React, { useEffect, useState } from 'react';

import axios from '../utils/axios';
import GamePlayerCardRight from '../features/matches/GamePlayerCardRight';
import GamePlayerCardLeft from '../features/matches/GamePlayerCardLeft';
import TennisBallScene from '../features/matches/TennisBallScene';
import { UserData, PlayerStats } from '../utils/types';

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

const GameWrapper: React.FC = () => {
    const [players, setPlayers] = useState<PlayerStats[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const handleStartGame = () => {
        console.log('Game started!');
        // Your game start logic here
    };

    useEffect(() => {
        const fetchPlayers = async (): Promise<void> => {
            try {
                setIsLoading(true);
                const response =
                    await axios.get<PlayerStats[]>('/get/playerlist/');
                setPlayers(response.data);
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
        <div className="container mx-auto px-2">
            <h1 className="text-3xl font-bold text-center">Game Players</h1>
            <div className="flex flex-wrap justify-center gap-6">
                <GamePlayerCardLeft player={players[1]} />
                <GamePlayerCardRight player={players[2]} />
            </div>
            <TennisBallScene
                onStartGame={handleStartGame}
                className="z-11"
                style={{
                    position: 'relative',
                    top: '80%', // Center vertically
                    left: '50%', // Center horizontally
                    transform: 'translate(-50%, -50%)',
                    width: '120px', // Adjust size as needed
                    height: '120px', // Adjust size as needed
                }}
            />
        </div>
    );
};

export default GameWrapper;
