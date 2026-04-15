// types for handling realtime presence and request via websocket

export interface Friend {
    user: string;
    status?: ChatRequestStatus;

    presence?: PresenceState;
}

export type PresenceState = 'online' | 'offline' | 'idle' | 'dnd' | 'playing';

export type ChatRequestStatus =
    | 'pending'
    | 'active'
    | 'rejected'
    | 'cancelled'
    | 'closed'
    | 'default';
