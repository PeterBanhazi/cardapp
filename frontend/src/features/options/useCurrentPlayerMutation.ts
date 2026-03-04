import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../../core/utils/useAxios';

export function useCurrentPlayerMutation() {
    const queryClient = useQueryClient();

    // Mutation function for updating the current player
    const mutation = useMutation({
        mutationFn: async (newCurrentPlayer: number) => {
            const response = await useAxios().patch('/options/', {
                current_player_id_change: newCurrentPlayer,
            });
            return response.data;
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['userproperties'],
            });
        },
        onError: (error) => {
            console.error('Error updating current player:', error);
        },
    });

    // Function to trigger the mutation
    const chooseCurrentPlayer = (id: number) => {
        mutation.mutate(id);
    };

    return { chooseCurrentPlayer, ...mutation };
};
