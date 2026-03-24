import { useQueries } from '@tanstack/react-query';
import { useAuthStore } from '@/core/store/useAuthStore';
import type {
    ApiFriendship,
    ApiFriendRequest,
    FriendListItemData,
    FriendshipStatus,
    ApiUser,
} from './friendTypes';
import useAxios from '../../core/utils/useAxios';
import { error } from 'console';
// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchFriends(): Promise<ApiFriendship[]> {
    return await useAxios().get<ApiFriendship[]>('friends/')
        .then((response) => response.data)
        .catch((error) => {
            throw new Error('Failed to fetch friends' + error);
    })    
} 

async function fetchSentRequests(): Promise<ApiFriendRequest[]> {
    return await useAxios().get<ApiFriendRequest[]>('friends/requests/?direction=sent')
        .then((response) => response.data)
        .catch((error) => {
            throw new Error('Failed to fetch sent requests' + error);
    })
}

async function fetchReceivedRequests(): Promise<ApiFriendRequest[]> {
    return await useAxios().get<ApiFriendRequest[]>('friends/requests/?direction=received')
        .then((response) => response.data)
        .catch((error) => {
        throw new Error('Failed to fetch received requests' + error);
    })
}

// ---------------------------------------------------------------------------
// Sort order helper
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<FriendshipStatus, number> = {
    pending: 0,
    accepted: 1,
    rejected: 2,
};

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------

export interface UseFriendListResult {
    data: FriendListItemData[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

export function useFriendList(): UseFriendListResult {
    const loggedInUsername = useAuthStore((state) => state.user?.username);

    const [friendsQuery, sentQuery, receivedQuery] = useQueries({
        queries: [
            {
                queryKey: ['friends'],
                queryFn: fetchFriends,
            },
            {
                queryKey: ['friendRequests', 'sent'],
                queryFn: fetchSentRequests,
            },
            {
                queryKey: ['friendRequests', 'received'],
                queryFn: fetchReceivedRequests,
            },
        ],
    });

    const isLoading =
        friendsQuery.isLoading || sentQuery.isLoading || receivedQuery.isLoading;

    const isError =
        friendsQuery.isError || sentQuery.isError || receivedQuery.isError;

    const error =
        (friendsQuery.error as Error | null) ??
        (sentQuery.error as Error | null) ??
        (receivedQuery.error as Error | null);

    // Only transform once all three queries have settled
    if (isLoading || isError) {
        return { data: [], isLoading, isError, error };
    }

    const friendships = friendsQuery.data ?? [];
    const sentRequests = sentQuery.data ?? [];
    const receivedRequests = receivedQuery.data ?? [];

    // 1. Confirmed friends → always 'accepted'
    const fromFriendships: FriendListItemData[] = friendships.map((f) => ({
        friend_req_id: f.friend_req_id,
        friend: {
            id: f.friend.id,
            username: f.friend.username,
            avatar_image: f.friend.avatar_image,
            rankpoints: f.friend.rankpoints,
            current_player: f.friend.current_player,
        },
        status: 'accepted' as const,
        created_at: f.created_at,
        source: 'friendship' as const,
    }));

    // Helper: given a request, return whichever of sender/receiver is NOT the initiator.
    // sender/receiver are canonical storage pairs (like user1/user2) — the initiator
    // field is the reliable signal for who started the request.
    const getOtherUser = (r: ApiFriendRequest): ApiUser =>
        r.sender.username === r.initiator.username ? r.receiver : r.sender;
 
    // 2. Sent requests — initiator === loggedInUsername, so the friend is the other user.
    const fromSent: FriendListItemData[] = sentRequests.map((r) => {
        const friend = getOtherUser(r);
        return {
            friend_req_id: r.friend_req_id,
            friend: { id: friend.id, username: friend.username },
            status: r.status,
            created_at: r.created_at,
            source: 'sent' as const,
        };
    });
 
    // 3. Received requests — initiator is the friend who sent the request,
    //    so the friend is the initiator and the logged-in user is the other side.
    const fromReceived: FriendListItemData[] = receivedRequests.map((r) => {
        const friend = r.initiator; // the person who initiated is the one to display
        return {
            friend_req_id: r.friend_req_id,
            friend: { id: friend.id, username: friend.username },
            status: r.status,
            created_at: r.created_at,
            source: 'received' as const,
        };
    });

    // Merge and deduplicate by friend_req_id
    // (a confirmed friendship won't appear in requests, but guard anyway)
    const seen = new Set<number>();
    const merged: FriendListItemData[] = [];

    for (const item of [...fromFriendships, ...fromSent, ...fromReceived]) {
        if (!seen.has(item.friend_req_id)) {
            seen.add(item.friend_req_id);
            merged.push(item);
        }
    }

    // Sort: pending → accepted → rejected, then by date descending within each group
    merged.sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return { data: merged, isLoading: false, isError: false, error: null };
}
