import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { PlayerStats } from '../../utils/types';
import { TbUserEdit } from 'react-icons/tb';
import { LuHistory } from 'react-icons/lu';
import { FaStar } from 'react-icons/fa6';

// id: number;
// creator_username: string | number | null;
// name: string;
// avatar_url: string;
// serve: number;
// forehand: number;
// backhand: number;
// volley: number;
// stamina: number;
// agility: number;
type PlayerAbilities = Omit<
    PlayerStats,
    'id' | 'name' | 'creator_username' | 'avatar_url'
>;
interface PlayerCardProps {
    player: PlayerStats;
    cardtype: 'DEFAULT' | 'CUSTOM' | 'FAVORITE' | 'CURRENT';
}

const TennisPlayerCards: React.FC<{ player: PlayerStats }> = ({ player }) => {
    const abilities = {
        serve: player.serve,
        forehand: player.forehand,
        backhand: player.backhand,
        volley: player.volley,
        stamina: player.stamina,
        agility: player.agility,
    };

    return (
        <>
            <div className="flex gap-1 max-w-min">
                <Card
                    key={player.name}
                    className="flex flex-col w-[148px] h-[294px] bg-slate-800 text-slate-100 border-1 ring-2 ring-inset ring-gray-400"
                >
                    <CardHeader className="p-1">
                        <div className="w-full flex pt-1 pl-1 pr-1 justify-between relative">
                            <LuHistory className="m-1 hover:cursor-pointer hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] transition-shadow duration-200" />

                            <img
                                src={player.avatar_url}
                                alt={player.name}
                                className="w-16 h-16 rounded-full mx-auto ring-2 ring-gray-400"
                            />
                            <div className="absolute top-5 right-24 translate-x-0.5 flex-col items-center justify-center bg-slate-800 rounded-2xl py-0.5 ring-1 ring-slate-500">
                                <FaStar className="w-2.5 h-2.5 text-yellow-300" />
                                <FaStar className="w-2.5 h-2.5 text-yellow-300" />
                                <FaStar className="w-2.5 h-2.5 text-yellow-300" />
                            </div>
                            <TbUserEdit className="m-1 hover:cursor-pointer hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] transition-shadow duration-200" />
                        </div>
                    </CardHeader>
                    <div className="flex flex-col justify-between">
                        <CardContent className="p-1">
                            <CardTitle className="mb-2.5 flex font-normal tracking-tighter justify-center ">
                                {player.name}
                            </CardTitle>
                            <div className="relative flex flex-col justify-self-center gap-2.5 w-[122px]">
                                {Object.entries(abilities).map(
                                    ([skill, value]) => (
                                        <div
                                            key={skill}
                                            className="bg-slate-600 flex justify-between h-3.5 ring-1 ring-slate-300 rounded-3xl overflow-hidden"
                                        >
                                            <div className="capitalize self-center absolute z-10 -translate-y-px">
                                                <div className="pl-1.5 text-xs ">
                                                    {skill}
                                                </div>
                                            </div>
                                            <div
                                                className="w-full bg-gray-400 self-center ring-1 ring-slate-300 rounded-3xl h-3.5"
                                                style={{
                                                    transform: `translateX(${
                                                        value - 100
                                                    }%)`,
                                                }}
                                            >
                                                <div className="bg-blue-600 ring-0 h-3.5 flex rounded-3xl origin-left"></div>
                                            </div>
                                            <div className="h-full w-6 ml-1.5 ring-1 ring-slate-300 rounded-full bg-slate-800">
                                                <div className="text-xs font-semibold flex text-white justify-center -translate-y-[2px]">
                                                    {value}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                        <div className="mt-3 w-full px-3">
                            <div className="flex text-sm font-medium justify-between">
                                <button className="bg-orange-700 hover:bg-orange-500 hover:ring-1 ring-slate-300 text-white rounded px-1 py-0.5">
                                    Favorite
                                </button>
                                <button className="bg-orange-700 hover:bg-orange-500 hover:ring-1 ring-slate-300 text-white rounded px-1 py-0.5">
                                    Choose
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default TennisPlayerCards;
