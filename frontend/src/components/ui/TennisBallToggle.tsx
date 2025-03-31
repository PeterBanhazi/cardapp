import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../../utils/useAxios';

export const TennisBallToggle: React.FC<{ isOnline: boolean }> = ({
    isOnline,
}) => {
    const [isOnSwitch, setIsOnSwitch] = useState(isOnline);
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsOnSwitch(isOnline);
    }, []);

    // Define the mutation

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
        <div
            className={`relative h-6 w-11 cursor-pointer ring-2  ring-slate-900 shadow-[inset_0px_0px_10px_-4px_rgba(0,_0,_0,_0.7)] rounded-full transition-colors duration-200 ease-in-out
        ${
            isOnSwitch
                ? 'bg-green-500 bg-opacity-80 '
                : 'bg-gray-600 bg-opacity-30'
        }`}
            onClick={() => {
                setIsOnSwitch((e) => !e);
                mutate(!isOnSwitch);
            }}
        >
            <div
                className={`absolute top-[0px] left-0 flex h-[24px] w-[24px] transform items-center justify-center rounded-full 
          transition-transform duration-200 ease-in-out 
          ${isOnSwitch ? 'translate-x-5' : 'translate-x-0'}`}
            >
                {/* Tennis ball with infinite rotation */}
                <div
                    className={`h-full w-full rounded-full filter 
            ${isOnSwitch ? 'brightness-110' : 'brightness-95'}
            animate-spin`}
                    style={{
                        animationDuration: '3s',
                        animationIterationCount: 'infinite',
                    }}
                >
                    <div className="relative h-full w-full overflow-hidden rounded-full hover:animate-spin hover:brightness-[1.15] ">
                        <img
                            src="src/assets/ui/icons/tennisballtoggle.png"
                            alt="toggle-ball"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TennisBallToggle;
