import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const PlayerCard = ({ player }) => {
    const { name, avatarUrl, abilities } = player;

    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2 w-64">
            <div className="flex items-center mb-4">
                <img
                    src={avatarUrl}
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
        </div>
    );
};

const TennisPlayersList = () => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/get/playerlist/');
                setPlayers(response.data.players);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
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
            <h1 className="text-3xl font-bold text-center ">Tennis Players</h1>
            <div className="flex flex-wrap justify-center">
                {players.map((player, index) => (
                    <PlayerCard key={index} player={player} />
                ))}
            </div>
        </div>
    );
};

export default TennisPlayersList;
