// ---------------------------------------------------------------------------
// Raw API response shapes
// ---------------------------------------------------------------------------

export interface ApiUser {
    id: number;
    username: string;
}

export interface ApiPlayer {
    id: number;
    name: string;
    avatar_url: string;
}

/** Shape returned by GET /api/friends/ */
export interface ApiFriendship {
    friend_req_id: number;
    user1: ApiUser;
    user2: ApiUser;
    friend: {
        id: number;
        username: string;
        avatar_image: string;
        rankpoints: number;
        current_player: ApiPlayer;
    };
    created_at: string;
}

/** Shape returned by GET /api/friends/requests/?direction=sent|received */
export interface ApiFriendRequest {
    friend_req_id: number;
    sender: ApiUser;
    receiver: ApiUser;
    initiator: ApiUser;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
}

// ---------------------------------------------------------------------------
// Unified shape consumed by the UI
// ---------------------------------------------------------------------------

export type FriendshipStatus = 'accepted' | 'pending' | 'rejected';

/** The "other person" shown in the list item */
export interface FriendDisplayUser {
    id: number;
    username: string;
    avatar_image?: string;
    rankpoints?: number;
    current_player?: ApiPlayer;
}

/**
 * A single row in the friend list, regardless of whether it came from
 * /api/friends/ or /api/friends/requests/.
 */
export interface FriendListItemData {
    /** The pk used for request-based API calls (accept / decline / cancel) */
    friend_req_id: number;
    friend: FriendDisplayUser;
    status: FriendshipStatus;
    created_at: string;
    /**
     * 'friendship'  → confirmed friend (from /api/friends/)
     * 'sent'        → pending request YOU sent
     * 'received'    → pending request sent TO you
     */
    source: 'friendship' | 'sent' | 'received';
}
