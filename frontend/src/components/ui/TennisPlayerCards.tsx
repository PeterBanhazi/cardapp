import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { PlayerStats } from '../../utils/types';
import { TbUserEdit } from 'react-icons/tb';
import { LuHistory } from 'react-icons/lu';
import { FaStar } from 'react-icons/fa6';
import { color } from 'framer-motion';

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

interface PlayerCardProps {
    player: PlayerStats;
    cardtype: 'DEFAULT' | 'CUSTOM' | 'FAVORITE' | 'CURRENT';
}

interface CardColors {
    mainborder: string;
    mainbackground: string;
    text: string;
    barraing: string;
    bartext: string;
    barnumber: string;
    button: string;
    buttonhover: string;
    buttontext: string;
}

const colors: Record<string, CardColors> = {
    DEFAULT: {
        mainborder: 'E63946',
        mainbackground: '669BBC',
        text: 'E63946',
        barraing: 'E63946',
        bartext: 'E63946',
        barnumber: 'E63946',
        button: 'E63946',
        buttonhover: 'E63946',
        buttontext: 'E63946',
    },
    CUSTOM: {
        mainborder: 'E63946',
        mainbackground: '003049',
        text: 'FDF0D5',
        barraing: 'E63946',
        bartext: 'E63946',
        barnumber: 'E63946',
        button: 'E63946',
        buttonhover: 'E63946',
        buttontext: 'E63946',
    },
    FAVORITE: {
        mainborder: '457B9D',
        mainbackground: '457B9D',
        text: '457B9D',
        barraing: '457B9D',
        bartext: '457B9D',
        barnumber: '457B9D',
        button: '457B9D',
        buttonhover: '457B9D',
        buttontext: '457B9D',
    },
    CURRENT: {
        mainborder: '1D3557',
        mainbackground: '1D3557',
        text: '1D3557',
        barraing: '1D3557',
        bartext: '1D3557',
        barnumber: '1D3557',
        button: '1D3557',
        buttonhover: '1D3557',
        buttontext: '1D3557',
    },
};

type PlayerAbilities = Omit<
    PlayerStats,
    'id' | 'name' | 'creator_username' | 'avatar_url'
>;

const getColorsByCardType = (
    cardtype: PlayerCardProps['cardtype']
): CardColors => {
    return colors[cardtype] || colors.DEFAULT;
};

const TennisPlayerCards: React.FC<PlayerCardProps> = ({ player, cardtype }) => {
    const abilities = {
        serve: player.serve,
        forehand: player.forehand,
        backhand: player.backhand,
        volley: player.volley,
        stamina: player.stamina,
        agility: player.agility,
    };
    const cardColors = getColorsByCardType(cardtype);

    return (
        <>
            <div className="flex w-[148px]">
                <Card
                    key={player.name}
                    className={`flex flex-col bg-slate-800 text-slate-200 w-[148px] h-[290px] border-1 ring-2 ring-inset ring-gray-400`}
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
                                                <div className="text-xs font-semibold flex justify-center -translate-y-[2px]">
                                                    {value}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                        <div className="w-full">
                            <div className="flex text-sm font-normal justify-between m-2.5 pt-0.5">
                                <button className="bg-orange-700 hover:bg-orange-500 hover:ring-1 ring-1 ring-slate-300 text-white rounded-xl px-1.5">
                                    Favorite
                                </button>
                                <button className="bg-orange-700 hover:bg-orange-500 hover:ring-1 ring-1 ring-slate-300 text-white rounded-xl px-1.5">
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
