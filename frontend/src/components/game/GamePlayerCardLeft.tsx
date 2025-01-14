import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Button } from 'flowbite-react';
import { useAuthStore } from '../../store/auth';

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

const GamePlayerCardLeft: React.FC<PlayerCardProps> = ({ player }) => {
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
        <div>
            <div className="flex">
                <div className="grid absolute">
                    <img
                        src="./src/components/game/GamePlayerCardLeft.svg"
                        className="opacity-100  col-start-1 row-start-1 self-center"
                        alt="Card Background"
                    />
                </div>
                <div className="col-start-1 row-start-1 z-10 ">
                    <div className=" p-1 m-2 ">
                        <div className="flex items-center mb-4">
                            <img
                                src={avatar_url}
                                alt={`${name} avatar`}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <h2 className="text-l font-bold text-center w-12 h-12">
                                {name}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 w-[118px]">
                            {Object.entries(abilities).map(([skill, value]) => (
                                <div
                                    key={skill}
                                    className="bg-gray-100 p-1 pt-0 h-8 rounded"
                                >
                                    <div className="text-xs capitalize flex justify-between">
                                        <div className="font-semibold">
                                            {skill}
                                        </div>
                                        <div>{value}</div>
                                    </div>

                                    <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full "
                                            style={{
                                                width: `${value}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 pt-2 gap-2 ">
                            <button
                                id="Favorite"
                                className=" bg-blue-600 bg-opacity-90 w-[85px] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                onClick={handleFavoriteClick}
                            >
                                Favorite
                            </button>
                            <button
                                id="Change"
                                className="bg-blue-600 bg-opacity-90 w-[60px] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                onClick={handleFavoriteClick}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlayerCardLeft;
