import useAxios from '../utils/useAxios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Friendship, PlayerStats, UserData } from '../utils/types';
import OptionsLeftContainer from '../components/OptionsLeftContainer';
import OptionsRightContainer from '../components/OptionsRightContainer';
import OptionsMiddleContainer from '../components/OptionsMiddleContainer';
import OptionsDnDCardWrapper from '../layouts/OptionsDnDCardWrapper';
import { PassThrough } from 'stream';
// import { console } from 'inspector';

function Options() {
    const api = useAxios();
    const fetchUserProperties = async (): Promise<UserData[] | any> => {
        return await api
            .get<UserData[]>('options/')
            .then((response) => response.data);
    };

    const fetchPlayerProperties = async (): Promise<UserData[] | any> => {
        return await api
            .get<PlayerStats[]>('get/playerlist/')
            .then((response) => response.data);
    };

    const { isPending, isError, data, error } = useQuery({
        queryKey: ['userproperties'],
        queryFn: fetchUserProperties,
    });

    const playerlistdata = useQuery({
        queryKey: ['playerlist'],
        queryFn: fetchPlayerProperties,
    });
    if (isPending) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }

    const defaultPlayerArray = [];
    for (let i = 0; i < 10; i++) {
        defaultPlayerArray[i] = playerlistdata.data.players[i];
        defaultPlayerArray[i].cardtype = 'DEFAULT';
    }

    console.log(data);

    data.custom_players.forEach(myFunction);
    data.favorite_players.forEach(myFunctioFav);
    function myFunction(item: { cardtype: string }) {
        item.cardtype = 'CUSTOM';
    }

    function myFunctioFav(item: { cardtype: string }) {
        item.cardtype = 'FAVOURITE';
    }
    // data.current_player.cardtype = 'CURRENT';

    const allPlayersPlusId = defaultPlayerArray.concat(
        data.custom_players.concat(data.favorite_players)
    );
    // function addPlusId(item: {
    //     [x: string]: any;
    //     plusid: string;
    // }): PlayerStats[] {
    //     return (item.plusid = item.id + item.cardtype);
    // }
    // allPlayersPlusId.forEach(addPlusId);
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

    console.log(allPlayersPlusId);
    const currentCardId: number = data.current_player.id;
    const favouriteCardIds = getFavoritePlayerIds(data);
    console.log('fav' + favouriteCardIds);
    console.log(currentCardId);

    const filteredPlayers: PlayerStats[] = filterOutFavoritePlayers(
        allPlayersPlusId,
        favouriteCardIds
    );
    console.log(filteredPlayers);
    const foundPlayer = filteredPlayers.filter((p) => p.id === currentCardId);

    const updatedPlayer = foundPlayer ? { ...foundPlayer } : null;
    // const newCurrentPlayer = [
    //     ...filteredPlayers.find((player) => player.id === currentCardId),
    // ];
    console.log(filteredPlayers);
    return (
        <div className="flex justify-evenly w-full h-[592px] ">
            <OptionsDnDCardWrapper
                playerCards={filteredPlayers}
                currentCardId={currentCardId}
            >
                <div className="w-[150px] h-[532px]">
                    {/* <OptionsLeftContainer
                        currentPlayer={updatedPlayer!}
                        currentCardId={currentCardId}
                        isOnline={data.isonline}
                        rankPoints={data.rankpoints}
                    /> */}
                </div>
            </OptionsDnDCardWrapper>

            <div className="w-[150px] h-[592px]">
                <OptionsRightContainer friendships={data.friendships} />
            </div>
        </div>
    );
}

export default Options;
