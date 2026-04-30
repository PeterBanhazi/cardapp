import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/shared/components/ui/notifications/'; // adjust path as needed
import useAxios from '@/core/utils/useAxios';
import { PlayerStats } from '@/shared/types/types';
import { useRef } from 'react';
// TODO: fix backend endpoints, and data invalidations
// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatePlayerPayload = Pick<
    PlayerStats,
    | 'name'
    | 'avatar_url'
    | 'serve'
    | 'forehand'
    | 'backhand'
    | 'volley'
    | 'stamina'
    | 'agility'
>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreatePlayer(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    const api = useAxios();

    return useMutation({
        mutationKey: ['createPlayer'],
        mutationFn: (payload: CreatePlayerPayload) =>
            api.post('add-player/', payload),

        onSuccess: (_response, payload) => {
            useNotifications.getState().addNotification({
                type: 'success',
                title: 'Player Created!',
                message: `${payload.name} is ready to play.`,
            });

            // Invalidate any player list queries so they refetch

            queryClient.invalidateQueries({ queryKey: ['userproperties'] });

            onSuccess?.();
        },

        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                'Something went wrong. Please try again.';

            console.error('Create player error:', error?.response?.data);

            useNotifications.getState().addNotification({
                type: 'error',
                title: 'Error',
                message,
            });
        },
    });
}
