export interface PlayerStats {
    cardtype: "DEFAULT" | "CUSTOM" | "FAVOURITE" | "CURRENT";
    id: number;
    plusid: string;
    creator_username: number | string | null;
    name: string;
    avatar_url: string;
    serve: number;
    forehand: number;
    backhand: number;
    volley: number;
    stamina: number;
    agility: number;
}

export interface Friendship {
    friend_username: string;
    status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
    created_at: string;
}

export interface UserData {
    username: string;
    isonline: boolean;
    rankpoints: number;
    friendships: Friendship;
    favorite_players: PlayerStats[];
    current_player: PlayerStats[];
    custom_players: PlayerStats[];
}