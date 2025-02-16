import React from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from './ui/card';
import { PlayerStats } from '../utils/types';
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
                    className="flex flex-col w-[148px] h-[316px] bg-slate-800 text-slate-100 border-1 ring-2 ring-inset ring-gray-400"
                >
                    <CardHeader className="p-1">
                        <div className="w-full flex pt-1 pl-1 pr-1 justify-between relative">
                            <LuHistory className="m-1 hover:cursor-pointer" />

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
                            <TbUserEdit className="m-1 hover:cursor-pointer" />
                        </div>
                    </CardHeader>
                    <div className="flex flex-col justify-between">
                        <CardContent className="p-1">
                            <CardTitle className="mb-2.5 flex font-normal tracking-tighter justify-center ">
                                {player.name}
                            </CardTitle>
                            <div className="relative flex flex-col justify-self-center gap-2 w-[122px]">
                                {Object.entries(abilities).map(
                                    ([skill, value]) => (
                                        <div
                                            key={skill}
                                            className="bg-slate-600 flex justify-between h-4 ring-1 ring-slate-300 rounded-3xl"
                                        >
                                            <div className="w-full bg-gray-400 self-center ring-1 ring-slate-300 rounded-3xl h-4">
                                                <div
                                                    className="bg-blue-600 ring-0 h-4 flex rounded-3xl"
                                                    style={{
                                                        width: `${value}%`,
                                                    }}
                                                >
                                                    <div className="capitalize self-center -translate-y-px">
                                                        <div className="pl-1.5 text-xs">
                                                            {skill}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-full w-6 ml-1.5 ring-1 ring-slate-300 rounded-full bg-slate-800 ">
                                                <div className="text-xs font-semibold flex justify-center -translate-y-px">
                                                    {value}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
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
            </div>
        </>
    );
};

export default TennisPlayerCards;
