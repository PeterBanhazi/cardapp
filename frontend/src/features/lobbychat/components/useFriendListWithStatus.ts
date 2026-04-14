// useFriendListWithStatus.ts
import { useMemo } from 'react';
import { useFriendList } from '@/core/store/useFriendList'; 
import { useFriendsStore } from '@/core/store//useFriendsStore'; 

import type {
    FriendDisplayUser,
} from '@/shared/types/friendTypes';

export type FriendStatus = 'active' | 'pending' | 'rejected' | 'cancelled' | 'online' | 'closed' | 'offline';

export interface FriendWithStatus {
    friend_req_id: number;
    created_at: string;
    friend: FriendDisplayUser;
    status: FriendStatus;
}
const statusPriority: Record<FriendStatus, number> = {
    active: 0,
    pending: 1,
    rejected: 2,
    cancelled: 3,
    online: 4,
    closed: 5,
    offline: 6,
};

export function useFriendListWithStatus(): FriendWithStatus[] {
    const { data: friendships } = useFriendList();
    const { friends } = useFriendsStore();

    return useMemo(() => {
        if (!friendships) return [];
        // only accepted friendships are shown in list + avatar and other data
        return friendships
            .filter((f) => f.source === 'friendship')
            .map((f): FriendWithStatus => ({
                friend_req_id: f.friend_req_id,
                created_at: f.created_at,
                friend: f.friend as FriendDisplayUser,
                status: (friends[f.friend.username]?.status ?? 'offline') as FriendStatus,
            }))
            .sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    }, [friendships, friends]);
}