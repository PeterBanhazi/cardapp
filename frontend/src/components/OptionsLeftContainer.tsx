import React, { useState } from 'react';
import { PlayerStats } from '../utils/types';
import { Switch } from 'radix-ui';
import TennisPlayerCards from './ui/TennisPlayerCards';
import TennisPlayerCreator from './TennisPlayerCreator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';

const OptionsLeftContainer: React.FC<{
    player: PlayerStats;
    isOnline: boolean;
    rankPoints: number;
}> = ({ player, isOnline, rankPoints }) => {
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
    return (
        <div className="w-full h-full p-1 flex flex-col gap-1 items-center justify-start bg-transparent border">
            <div className="text-lg font-semibold">
                Rank Points: {rankPoints}
            </div>

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
            <div>
                <div className="relative"></div>
                <TennisPlayerCards player={player} cardtype="CUSTOM" />

                <div className="flex flex-row justify-self-center">
                    <button className="bg-slate-400 ">Option1</button>

                    <button>Option2</button>
                </div>
                <div>
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
                </div>
            </div>
        </div>
    );
};

export default OptionsLeftContainer;
