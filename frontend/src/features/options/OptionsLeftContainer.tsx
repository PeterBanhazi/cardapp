import React, { ReactNode, useState } from 'react';
import { PlayerStats } from '../../shared/types/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../../core/utils/useAxios';
import { useDroppable } from '@dnd-kit/core';

import { RiCrosshair2Line } from 'react-icons/ri';
import TennisBallToggle from '../../shared/components/ui/TennisBallToggle';
import TennisPlayerCards from './playercards/TennisPlayerCards';
import ScrollContainer from '../../shared/components/ui/ScrollContainer';
import OptionsPlayerCreator from './OptionsPlayerCreator';

const OptionsLeftContainer: React.FC<{
    currentPlayer: PlayerStats[];
    isOnline: boolean;
    rankPoints: number;
    currentCardId: number;
    children: ReactNode;
    isDragging: boolean;
}> = ({
    currentPlayer,
    isOnline,
    rankPoints,
    currentCardId,
    children,
    isDragging,
}) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const queryClient = useQueryClient();
    const addTodoMutation = useMutation({
        mutationFn: (newTodo: boolean): any =>
            useAxios().patch('options/', { isonline: newTodo }),
        // make sure to _return_ the Promise from the query invalidation
        // so that the mutation stays in `pending` state until the refetch is finished
        onSettled: async () => {
            return await queryClient.invalidateQueries({
                queryKey: ['userproperties'],
            });
        },
    });

    const { isPending, submittedAt, variables, mutate, isError } =
        addTodoMutation;

    const { setNodeRef, isOver } = useDroppable({
        id: 'droppable',
        // ### data can be useful to mach isover card's id equation
        data: {
            accepts: ['type1', 'type2'],
        },
    });

    return (
        <>
            <div className="w-full h-full  flex flex-col items-center gap-4 justify-start">
                <div className="w-full flex flex-col bg-slate-200/20 rounded-md h-28 border border-blue-200 shadow-md">
                    <div className="bg-slate-200/40 pl-1.5 font-semibold w-full text-slate-800 ">
                        Rank Points: {rankPoints}
                    </div>
                    <div className="pt-2 px-2 grid grid-rows-3 gap-0 w-full">
                        <div className="flex justify-between px-0.5">
                            <div
                                className={`font-semibold
                                                    ${
                                                        isOnline
                                                            ? 'text-green-400'
                                                            : 'text-gray-700'
                                                    }`}
                            >
                                {isOnline ? 'Ready' : 'Ready, Set!'}
                            </div>
                            <div className="scale-[0.80]">
                                <TennisBallToggle isOnline={isOnline} />
                            </div>
                        </div>
                        <div className="h-[12px] border-b border-slate-200"></div>
                        <div className="flex justify-between px-0.5">
                            <div className="font-semibold text-gray-700">
                                Reset list:
                            </div>
                            <div className="min-w-8 flex">{children}</div>
                        </div>
                    </div>
                </div>

                <div className="current-card-container pt-2">
                    <div className="relative">
                        {isDragging ? (
                            <div className="top-0 left-0 absolute z-30 w-[148px] h-[290px] border-2 border-slate-400/70 rounded-xl bg-gray-600/40 flex">
                                <div className="flex animate-pulse self-center place-content-center  min-w-full">
                                    <div className="w-fit z-14">
                                        <RiCrosshair2Line
                                            size={100}
                                            className="opacity-50 text-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                        <div className="z-20 relative">
                            <div
                                ref={setNodeRef}
                                className={`${
                                    isOver
                                        ? 'rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.9)] shadow-yellow-200 transition-shadow duration-300 animate-pulse'
                                        : ''
                                }`}
                            >
                                {currentPlayer && (
                                    <TennisPlayerCards
                                        isSortable={false}
                                        player={currentPlayer[0]}
                                        isInCurrentContainer={true}
                                        currentCardId={currentCardId}
                                    />
                                )}
                            </div>
                        </div>
                        <ScrollContainer
                            className="mt-5 h-[143px]"
                            headertext={<div>Card Actions</div>}
                        >
                            <div className="mt-2 justify-self-center">
                                <button
                                    className="hover:ring-1 ring-1 hover:cursor-pointer shadow-[inset_0px_0px_8px_-6px_rgba(0,_0,_0,_0.9)] text-md font-semibold ring-current rounded-sm px-0.5"
                                    style={{
                                        backgroundColor: `#84cc16`,
                                    }}
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    <div
                                        className="-translate-y-[1px] hover:drop-shadow-[0_0_6px_rgba(255,255,255,1)]"
                                        style={{
                                            color: `#292524`,
                                        }}
                                    >
                                        Create new player
                                    </div>
                                </button>
                                {isCreateOpen && (
                                    <OptionsPlayerCreator
                                        onClose={() => setIsCreateOpen(false)}
                                    />
                                )}
                            </div>
                        </ScrollContainer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OptionsLeftContainer;
