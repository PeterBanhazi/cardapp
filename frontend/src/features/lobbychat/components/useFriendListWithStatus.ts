// useFriendListWithStatus.ts
import { useMemo } from 'react';
import { useFriendList } from '@/core/store/useFriendList';
import { useFriendsStore } from '@/core/store//useFriendsStore';

import type { FriendDisplayUser } from '@/shared/types/friendTypes';
import {
    ChatRequestStatus,
    Friend,
    PresenceState,
} from '@/shared/types/friend';

export interface FriendWithStatus {
    friend_req_id: number;
    created_at: string;
    friend: FriendDisplayUser;
    status: ChatRequestStatus;
    presence: PresenceState;
}
const statusPriority: Record<ChatRequestStatus, number> = {
    active: 0,
    pending: 1,
    default: 2,
    cancelled: 3,
    rejected: 4,
    closed: 5,
};

export function useFriendListWithStatus(): FriendWithStatus[] {
    const { data: friendships } = useFriendList();
    const { friends } = useFriendsStore();

    return useMemo(() => {
        if (!friendships) return [];
        // only accepted friendships are shown in list + avatar and other data
        return friendships
            .filter((f) => f.source === 'friendship')
            .map(
                (f): FriendWithStatus => ({
                    friend_req_id: f.friend_req_id,
                    created_at: f.created_at,
                    friend: f.friend as FriendDisplayUser,
                    status: (friends[f.friend.username]?.status ??
                        'default') as ChatRequestStatus,
                    presence: (friends[f.friend.username]?.presence ??
                        'offline') as PresenceState,
                })
            )
            .sort(
                (a, b) => statusPriority[a.status] - statusPriority[b.status]
            );
    }, [friendships, friends]);
}
