import React, { Children, ReactNode, useState } from 'react';
import { PlayerStats } from '../utils/types';
import { Switch } from 'radix-ui';
import TennisPlayerCards from './ui/TennisPlayerCards';
import TennisPlayerCreator from './TennisPlayerCreator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';
import { useDroppable } from '@dnd-kit/core';

import { RiCrosshair2Line } from 'react-icons/ri';
import TennisBallToggle from './ui/TennisBallToggle';

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
    const [isOnlineSwitch, setIsOnlineSwitch] = useState(isOnline);

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
        <div className="w-full h-full p-1 flex flex-col gap-1 items-center justify-start bg-transparent">
            <div className="text-lg font-semibold">
                Rank Points: {rankPoints}
            </div>
            <div className="h-2 w-2">{children}</div>
            <div>
                <form>
                    <div className="grid grid-cols-2 gap-5 w-full">
                        <label
                            className={`text-sm  font-bold
            ${isOnline ? 'text-green-400' : 'text-gray-700'}`}
                            htmlFor="online-mode"
                        >
                            {isOnline ? 'Online' : 'Go Online!'}
                        </label>
                        <Switch.Root
                            className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-green-500"
                            id="online-mode"
                            checked={isOnline}
                            onCheckedChange={() => {
                                mutate(!isOnlineSwitch),
                                    setIsOnlineSwitch((e) => !e);
                            }}
                            style={{
                                WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
                            }}
                        >
                            <Switch.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
                        </Switch.Root>
                    </div>
                </form>
            </div>
            <div className="relative">
                {isDragging ? (
                    <div className="top-0 left-0 absolute z-30 w-[148px] h-[290px] border-2 border-slate-400 border-opacity-70 rounded-xl bg-gray-600 bg-opacity-40 flex">
                        <div className="flex animate-pulse self-center place-content-center min-w-full">
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

                <div className="flex flex-row mt-6 justify-self-center">
                    <button className="bg-slate-400 ">Option1</button>

                    <button>Option2</button>
                </div>
                <div className="mt-3">
                    <button
                        className="flex rounded-xl border-2 justify-self-center"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create
                    </button>
                    {isCreateOpen && (
                        <TennisPlayerCreator
                            onClose={() => setIsCreateOpen(false)}
                        />
                    )}
                    <button
                        className="flex rounded-xl border-2 justify-self-center"
                        onClick={() => {
                            mutate(isOnline ? false : true);
                        }}
                    >
                        mutate
                    </button>
                    <TennisBallToggle isOnline={isOnline} />
                </div>
            </div>
        </div>
    );
};

export default OptionsLeftContainer;
