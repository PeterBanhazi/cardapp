import { useQuery } from '@tanstack/react-query';
import { UserData, PlayerStats } from '../utils/types';
import useAxios from '../utils/useAxios';

interface OptionsDataResult {
    updatedPlayer: PlayerStats[] | null;
    currentCardId: number;
    filteredPlayers: PlayerStats[];
    data: UserData | null;
    isPending: boolean; 
    isError: boolean;
    error: Error | null;
    isOnline: boolean;
    rankPoints: number;
}

export function useOptionsDataTransformer(): OptionsDataResult {
    const api = useAxios(); 

    // Fetch user properties
    const fetchUserProperties = async (): Promise<UserData> => {
        return await api
            .get<UserData>('options/')
            .then((response) => response.data);
    };

    // Fetch player properties
    const fetchPlayerProperties = async (): Promise<PlayerStats[]> => {
        return await api
            .get<PlayerStats[]>('get/playerlist/')
            .then((response) => response.data);
    };

    // Query for user properties
    const {
        isPending,
        isError,
        data: userData,
        error,
    } = useQuery({
        queryKey: ['userproperties'],
        queryFn: fetchUserProperties,
    });

    // Query for player list
    const {
        data: playerListData,
        isPending: isPlayerListPending,
        isError: isPlayerListError,
        error: playerListError,
    } = useQuery({
        queryKey: ['playerlist'],
        queryFn: fetchPlayerProperties,
    });

    // Handle loading state
    if (isPending || isPlayerListPending) {
        return {
            updatedPlayer: null,
            currentCardId: 0,
            filteredPlayers: [],
            data: null,
            isPending: true,
            isError: false,
            error: null,
            isOnline: false,
            rankPoints: 0,
        };
    }

    // Handle error state
    if (isError || isPlayerListError) {
        return {
            updatedPlayer: null,
            currentCardId: 0,
            filteredPlayers: [],
            data: null,
            isPending: false,
            isError: true,
            isOnline: false,
            rankPoints: 0,
            error: error || playerListError,
        };
    }
   
    // Transform data
    // Add type for card design colors
    const defaultPlayerArray = playerListData.slice(0, 10).map((player) => ({
        ...player,
        cardtype: 'DEFAULT' as const,
        plusid: `${player.id}-DEFAULT`,
    }));

    userData.custom_players.forEach(myFunction);
    userData.favorite_players.forEach(myFunctioFav);
    function myFunction(item: { cardtype: string }) {
        item.cardtype = 'CUSTOM';
    }

    function myFunctioFav(item: { cardtype: string }) {
        item.cardtype = 'FAVOURITE';
    }

    // Combine all players
    const allPlayersPlusId = [
        ...defaultPlayerArray,
        ...userData.custom_players,
        ...userData.favorite_players,
    ];

    function getFavoritePlayerIds(response: UserData): number[] {
        return response.favorite_players && response.favorite_players.length > 0
            ? response.favorite_players.map((player) => player.id)
            : [];
    }

    function filterOutFavoritePlayers<T extends PlayerStats>(
        players: T[],
        favoritePlayerIds: number[]
    ): T[] {
        return players.filter(
            (player) =>
                player.cardtype === 'FAVOURITE' ||
                !favoritePlayerIds.includes(player.id)
        );
    }

    const currentCardId: number = userData.current_player.id;
    const favouriteCardIds = getFavoritePlayerIds(userData);


    const filteredPlayers: PlayerStats[] = filterOutFavoritePlayers(
        allPlayersPlusId,
        favouriteCardIds
    );

    const foundPlayer = filteredPlayers.filter((p) => p.id === currentCardId);

    return {
        updatedPlayer: foundPlayer,
        currentCardId,
        filteredPlayers,
        data: userData,
        isOnline: userData.isonline,
        rankPoints: userData.rankpoints,
        isPending: false,
        isError: false,
        error: null,
    };
}
