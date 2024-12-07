import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAxios from '../utils/useAxios';
import { X, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '../store/auth'; // Adjust import path as needed

// Import player avatars
import djokovic from '../assets/djokovic_head.png';
import alcaraz from '../assets/alcaraz_head.png';
import sinner from '../assets/sinner_head.png';
import medvedev from '../assets/medvedev_head.png';
import rublev from '../assets/rublev_head.png';

// Define interface for player abilities
interface PlayerAbilities {
    serve: number;
    forehand: number;
    backhand: number;
    volley: number;
    stamina: number;
    agility: number;
}

// Define avatars
const AVATARS = [
    { name: 'Novak Djokovic', src: djokovic },
    { name: 'Carlos Alcaraz', src: alcaraz },
    { name: 'Jannik Sinner', src: sinner },
    { name: 'Daniil Medvedev', src: medvedev },
    { name: 'Andrey Rublev', src: rublev },
];

const TennisPlayerCreator: React.FC<{ onClose: () => void }> = ({
    onClose,
}) => {
    // Get username from auth store
    const user = useAuthStore((state) => state.user);
    const [isVisible, setIsVisible] = useState(true);

    // Initial state setup
    function generateRandomPlayerName() {
        return `TennisPlayer${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const [playerName, setPlayerName] = useState(generateRandomPlayerName());
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [abilities, setAbilities] = useState<PlayerAbilities>({
        serve: 50,
        forehand: 50,
        backhand: 50,
        volley: 50,
        stamina: 50,
        agility: 50,
    });

    // Track total points
    const [remainingPoints, setRemainingPoints] = useState(550);

    // Update remaining points when abilities change
    useEffect(() => {
        const totalPoints = Object.values(abilities).reduce((a, b) => a + b, 0);
        setRemainingPoints(550 - totalPoints);
    }, [abilities]);

    // Handle ability change
    const handleAbilityChange = (
        ability: keyof PlayerAbilities,
        value: number
    ) => {
        const newAbilities = { ...abilities, [ability]: value };
        const totalPoints = Object.values(newAbilities).reduce(
            (a, b) => a + b,
            0
        );

        if (totalPoints <= 550) {
            setAbilities(newAbilities);
        }
    };

    // Reset to initial state
    const handleReset = () => {
        setPlayerName(generateRandomPlayerName());
        setSelectedAvatar(AVATARS[0]);
        setAbilities({
            serve: 50,
            forehand: 50,
            backhand: 50,
            volley: 50,
            stamina: 50,
            agility: 50,
        });
    };

    // Submit player
    const submitPlayer = async (action: 'create' | 'play') => {
        // Validate name length
        if (playerName.length > 20) {
            alert('Player name must be 20 characters or less');
            return;
        }

        // Validate total points
        const totalPoints = Object.values(abilities).reduce((a, b) => a + b, 0);
        if (totalPoints > 550) {
            alert('Total ability points cannot exceed 550');
            return;
        }

        try {
            const creator = user()?.username;

            const playerData = {
                user: creator,
                name: playerName,
                avatarUrl: selectedAvatar.src,
                serve: abilities.serve,
                forehand: abilities.forehand,
                backhand: abilities.backhand,
                volley: abilities.volley,
                stamina: abilities.stamina,
                agility: abilities.agility,
            };

            console.log(playerData);
            const response = await useAxios().post('add-player/', playerData);

            if (action === 'play') {
                // Implement navigation or game start logic
                // For example: router.push(`/game/${response.data.playerId}`)
            }

            // Optional: Show success message or close modal
            onClose();
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Failed to create player. Please try again.');
        }
    };

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 w-[340px] h-[500px] relative flex flex-col">
                    {/* Close and Reset buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                            onClick={handleReset}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <RefreshCcw size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                onClose();
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Player Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Player Name
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => {
                                const newName = e.target.value.slice(0, 20);
                                setPlayerName(newName);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>

                    {/* Avatar Dropdown */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Avatar
                        </label>
                        <select
                            value={selectedAvatar.name}
                            onChange={(e) => {
                                const avatar = AVATARS.find(
                                    (a) => a.name === e.target.value
                                );
                                if (avatar) setSelectedAvatar(avatar);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {AVATARS.map((avatar) => (
                                <option key={avatar.name} value={avatar.name}>
                                    {avatar.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ability Sliders */}
                    <div className="flex-grow overflow-y-auto">
                        {(
                            Object.keys(abilities) as Array<
                                keyof PlayerAbilities
                            >
                        ).map((ability) => (
                            <div key={ability} className="mb-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm capitalize">
                                        {ability}
                                    </label>
                                    <input
                                        type="number"
                                        value={abilities[ability]}
                                        min={1}
                                        max={100}
                                        onChange={(e) => {
                                            const value = parseInt(
                                                e.target.value
                                            );
                                            handleAbilityChange(ability, value);
                                        }}
                                        className="w-16 ml-2 text-center rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={100}
                                    value={abilities[ability]}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        handleAbilityChange(ability, value);
                                    }}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Remaining Points */}
                    <div className="text-center mb-2 text-sm">
                        Remaining Points: {remainingPoints}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between space-x-2">
                        <button
                            onClick={() => submitPlayer('create')}
                            disabled={remainingPoints < 0}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => submitPlayer('play')}
                            disabled={remainingPoints < 0}
                            className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300"
                        >
                            Play
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TennisPlayerCreator;
