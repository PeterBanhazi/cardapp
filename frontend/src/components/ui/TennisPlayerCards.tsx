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
    nametext: string;
    mainbackground: string;
    ringcolor: string;
    barprogress: string;
    bartext: string;
    barnumber: string;
    button: string;
    buttonhover: string;
    buttontext: string;
}

const colors: Record<string, CardColors> = {
    // blue DEFAULT: {
    //     mainborder: 'E2E8f0',
    //     mainbackground: '1D3557',
    //     text: 'F1FAEE',
    //     barprogress: '457B9D',
    //     bartext: 'FFFFFF',
    //     barnumber: 'F1FAEE',
    //     button: '457B9D',
    //     buttonhover: '457B9D',
    //     buttontext: 'FDFDFF',
    // },
    // ## current:       mainbackground: 'f9844a',ca6702, e85d04

    DEFAULT: {
        nametext: 'E2E8f0',
        mainbackground: '1D3557',
        ringcolor: 'F1FAEE',
        barprogress: '457B9D',
        bartext: 'FFFFFF',
        barnumber: 'F1FAEE',
        button: 'CA6702',
        buttonhover: '457B9D',
        buttontext: 'FFFFFF',
    },

    CUSTOM: {
        nametext: '0f172a',
        mainbackground: 'A2CBC5',
        ringcolor: '023047',
        barprogress: 'EAAF51',
        bartext: '111827',
        barnumber: 'F1FAEE',
        button: 'C8553D',
        buttonhover: 'E63946',
        buttontext: 'fef9c3',
    },
    FAVORITE: {
        nametext: 'E2E8f0',
        mainbackground: 'e56b6f',
        ringcolor: 'a7f3d0',
        barprogress: '0891b2',
        bartext: 'fff1e6',
        barnumber: 'F1FAEE',
        button: '155e75',
        buttonhover: '457B9D',
        buttontext: 'fefae0',
    },
    CURRENT: {
        nametext: '1D3557',
        mainbackground: '1D3557',
        ringcolor: '1D3557',
        barprogress: '1D3557',
        bartext: '1D3557',
        barnumber: '1D3557',
        button: '6d28d9',
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
    /// ### use base textcolor for ring also

    return (
        <>
            <div className="flex w-[148px]">
                <Card
                    key={player.name}
                    className={`flex flex-col w-[148px] h-[290px] border-1 ring-1 ring-inset ring-current`}
                    style={{
                        backgroundColor: `#${cardColors.mainbackground}`,

                        color: `#${cardColors.ringcolor}`,
                    }}
                >
                    <CardHeader className="p-1">
                        <div className="w-full flex pt-1 pl-1 pr-1 justify-between relative">
                            <LuHistory className="m-1 hover:cursor-pointer hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] transition-shadow duration-200" />

                            <img
                                src={player.avatar_url}
                                alt={player.name}
                                className="w-16 h-16 rounded-full mx-auto ring-2 ring-current"
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
                            <CardTitle
                                className="mb-2.5 flex font-normal tracking-tighter justify-center"
                                style={{ color: `#${cardColors.nametext}` }}
                            >
                                {player.name}
                            </CardTitle>
                            <div className="relative flex flex-col justify-self-center gap-2.5 w-[126px]">
                                {Object.entries(abilities).map(
                                    ([skill, value]) => (
                                        <div
                                            key={skill}
                                            className="bg-black/20 flex justify-between h-3.5 ring-1 ring-current rounded-3xl overflow-hidden"
                                        >
                                            <div className="capitalize self-center absolute z-10 -translate-y-px">
                                                <div
                                                    className="pl-1.5 text-xs"
                                                    style={{
                                                        color: `#${cardColors.bartext}`,
                                                    }}
                                                >
                                                    {skill}
                                                </div>
                                            </div>
                                            <div
                                                className="w-full bg-gray-400 self-center ring-1 ring-current rounded-3xl h-3.5"
                                                style={{
                                                    transform: `translateX(${
                                                        value - 100
                                                    }%)`,
                                                }}
                                            >
                                                <div
                                                    className="ring-0 h-3.5 flex rounded-3xl origin-left"
                                                    style={{
                                                        backgroundColor: `#${cardColors.barprogress}`,
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="h-full w-6 ml-1.5 ring-1 ring-current rounded-full bg-black/60">
                                                <div
                                                    className="text-xs font-semibold flex justify-center -translate-y-[2px]"
                                                    style={{
                                                        color: `#${cardColors.barnumber}`,
                                                    }}
                                                >
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
                                <button
                                    className="hover:ring-1 ring-1 hover:cursor-pointer ring-current rounded-xl px-1.5 mb-0.5"
                                    style={{
                                        backgroundColor: `#${cardColors.button}`,
                                    }}
                                >
                                    <div
                                        className="-translate-y-[1px] hover:drop-shadow-[0_0_6px_rgba(255,255,255,1)]"
                                        style={{
                                            color: `#${cardColors.buttontext}`,
                                        }}
                                    >
                                        Favorite
                                    </div>
                                </button>
                                <button
                                    className="hover:ring-1 ring-1 hover:cursor-pointer ring-current rounded-xl px-1.5 mb-0.5"
                                    style={{
                                        backgroundColor: `#${cardColors.button}`,
                                    }}
                                >
                                    <div
                                        className="-translate-y-[1px] hover:drop-shadow-[0_0_6px_rgba(255,255,255,1)]"
                                        style={{
                                            color: `#${cardColors.buttontext}`,
                                        }}
                                    >
                                        Choose
                                    </div>
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
