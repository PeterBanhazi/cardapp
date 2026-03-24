import useAxios from "@/core/utils/useAxios";
import { useNotifications } from "@/shared/components/ui/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useFriendMutations() {
    const queryClient = useQueryClient();
    const api = useAxios();

    const invalidateFriends = () => {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    };

    return {
        acceptRequestMutation: useMutation({
            mutationFn: (id: number) =>
                api.post(`/friends/requests/${id}/action/`, { action: "accept" }),
            onSuccess: (response, id) => {
                console.log('SUCCESS:', response.data);
                useNotifications.getState().addNotification({
                    type: 'success',
                    title: 'Congratulations!',
                    message: `Your profile has been updated successfully! ${id}`,
                });
                invalidateFriends()
            },
            onError: (error: any) => {
    
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Something went wrong';

                console.error('ERROR:', error?.response?.data);

                useNotifications.getState().addNotification({
                    type: 'error',
                    title: 'Error',
                    message,
                });
            },
        }),
        rejectRequestMutation: useMutation({
            mutationFn: (id: number) =>
                api.post(`/friends/requests/${id}/action/`, { action: "reject" }),
                onSuccess: (response, id) => {
                console.log('SUCCESS:', response.data);
                useNotifications.getState().addNotification({
                    type: 'success',
                    title: 'Congratulations!',
                    message: `Your profile has been updated successfully! ${id}`,
                });
                invalidateFriends()
                },
                onError: (error: any) => {
    
                    const message =
                        error?.response?.data?.message ||
                        error?.response?.data?.detail ||
                        'Something went wrong';

                    console.error('ERROR:', error?.response?.data);

                    useNotifications.getState().addNotification({
                        type: 'error',
                        title: 'Error',
                        message,
                    });
            },
        }),
        cancelOrDeleteRequestMutation :useMutation({
                mutationFn: (friendReqId: number) =>
                    api.delete(`/friends/requests/${friendReqId}/`),
                            onSuccess: (response, id) => {
                console.log('SUCCESS:', response.data);
                useNotifications.getState().addNotification({
                    type: 'success',
                    title: 'Congratulations!',
                    message: `Your profile has been updated successfully! ${id}`,
                });
                invalidateFriends()
            },
            onError: (error: any) => {
    
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Something went wrong';

                console.error('ERROR:', error?.response?.data);

                useNotifications.getState().addNotification({
                    type: 'error',
                    title: 'Error',
                    message,
                });
            },
        }),
        sendFriendRequestMutation :useMutation({
                mutationFn: (friendInput: string) => {
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendInput);
                    const key = isEmail ? 'email' : 'username';
        
                    return api.post(`/friends/requests/`, {
                        [key]: friendInput,
                    });
                },
                onSuccess: (response, id) => {
                    console.log('SUCCESS:', response.data);
                    useNotifications.getState().addNotification({
                        type: 'success',
                        title: 'Congratulations!',
                        message: `Your profile has been updated successfully! ${id}`,
                    });
                    invalidateFriends()
            },
            onError: (error: any) => {
    
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Something went wrong';

                console.error('ERROR:', error?.response?.data);

                useNotifications.getState().addNotification({
                    type: 'error',
                    title: 'Error',
                    message,
                });
            },
                
            })
        
    };
}