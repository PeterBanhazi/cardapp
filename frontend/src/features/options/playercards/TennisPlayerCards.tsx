import React from 'react';

import { TbUserEdit } from 'react-icons/tb';
import { LuHistory } from 'react-icons/lu';
import { FaStar } from 'react-icons/fa6';
import { RotatingLines } from 'react-loader-spinner';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayerStats } from '../../../utils/types';
import useAxios from '../../../utils/useAxios';
import { useCurrentPlayerMutation } from '../useCurrentPlayerMutation';
import { Card, CardContent, CardHeader, CardTitle } from './card';

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

export interface PlayerCardProps {
    player: PlayerStats;
    isInCurrentContainer?: boolean;
    currentCardId: number;
    isSortable?: boolean;
    isDragging?: boolean;
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
    // ## current:       mainbackground: 'f9844a',ca6702, e85d04, ff5733

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
    FAVOURITE: {
        nametext: 'E2E8f0',
        mainbackground: 'cb5656',
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

const getColorsByCardType = (cardtype: PlayerStats['cardtype']): CardColors => {
    return colors[cardtype] || colors.DEFAULT;
};

const TennisPlayerCards: React.FC<PlayerCardProps> = ({
    player,
    isInCurrentContainer = false,
    currentCardId,
    isSortable = true,
    isDragging,
}) => {
    const { chooseCurrentPlayer, isPending, error } =
        useCurrentPlayerMutation();
    const isLoading = isPending;

    const abilities = {
        serve: player.serve,
        forehand: player.forehand,
        backhand: player.backhand,
        volley: player.volley,
        stamina: player.stamina,
        agility: player.agility,
    };
    const cardColors = getColorsByCardType(player.cardtype);
    /// ### use base textcolor for ring also

    const queryClient = useQueryClient();

    const toggleFavoritePlayerMutation = useMutation({
        mutationFn: async (playerId: number) => {
            const response = await useAxios().patch('options/', {
                favorite_player_id_change: playerId,
            });
            return response.data;
        },
        onSettled: async () => {
            return await queryClient.invalidateQueries({
                queryKey: ['userproperties'],
            });
        },
        onError: (error) => {
            console.error('Hiba történt!', error);
        },
    });

    const handleToggleFavorite = (playerId: number) => {
        toggleFavoritePlayerMutation.mutate(playerId);
    };

    return (
        <>
            <div
                // {...containerProps}

                className={`flex w-[148px] relative ${
                    isSortable ? 'touch-manipulation' : {}
                }`}
            >
                {isLoading ? (
                    <div className="flex top-0 left-0 absolute min-h-full min-w-full z-20 border-0 rounded-xl bg-gray-800/40">
                        <div className="flex self-center place-content-center min-w-full">
                            <div className=" w-fit z-12">
                                <RotatingLines
                                    width="52px"
                                    strokeColor="black"
                                    visible={true}
                                    animationDuration="1.25"
                                    ariaLabel="rotating-lines-loading"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {error ? (
                    <p className="text-red-800">Error: {error.message}</p>
                ) : (
                    <Card
                        key={player.name}
                        className={`flex flex-col w-[148px] h-[290px] border-0 ring-1 ring-inset ring-current transition duration-0 hover:shadow-md scale-100  hover:scale-[1.02] hover:shadow-slate-700 cursor-grab`}
                        style={
                            isInCurrentContainer
                                ? {
                                      cursor: `default`,
                                      userSelect: 'none',
                                      boxShadow:
                                          '0px 0px 2px rgba(250, 202, 21, 1)',
                                      //   transform: 'scale(1.02)',
                                      transform: 'none',
                                      backgroundColor: `#${cardColors.mainbackground}`,
                                      color: `#EAAF51`,
                                  }
                                : currentCardId == player.id
                                  ? {
                                        backgroundColor: `#${cardColors.mainbackground}`,
                                        color: `#EAAF51`,
                                    }
                                  : {
                                        backgroundColor: `#${cardColors.mainbackground}`,
                                        color: `#${cardColors.ringcolor}`,
                                    }
                        }
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
                                            onClick={() =>
                                                handleToggleFavorite(player.id)
                                            }
                                        >
                                            Favorite
                                        </div>
                                    </button>
                                    <button
                                        className="hover:ring-1 ring-1 hover:cursor-pointer ring-current rounded-xl px-1.5 mb-0.5"
                                        style={{
                                            backgroundColor: `#${cardColors.button}`,
                                        }}
                                        disabled={isLoading}
                                    >
                                        <div
                                            className="-translate-y-[1px] hover:drop-shadow-[0_0_6px_rgba(255,255,255,1)]"
                                            style={{
                                                color: `#${cardColors.buttontext}`,
                                            }}
                                            onClick={() =>
                                                chooseCurrentPlayer(player.id)
                                            }
                                        >
                                            {isInCurrentContainer
                                                ? 'Go Play'
                                                : 'Choose'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
};

export default TennisPlayerCards;
