import useAxios from '../utils/useAxios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Friendship, PlayerStats, UserData } from '../utils/types';
import OptionsLeftContainer from '../components/OptionsLeftContainer';
import OptionsRightContainer from '../components/OptionsRightContainer';
import OptionsMiddleContainer from '../components/OptionsMiddleContainer';

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
    console.log(playerlistdata);
    const defaultPlayerArray = [];
    for (let i = 0; i < 10; i++) {
        defaultPlayerArray[i] = playerlistdata.data.players[i];
        defaultPlayerArray[i].cardtype = 'DEFAULT';
    }
    console.log(defaultPlayerArray);

    console.log(data.custom_players);
    data.custom_players.forEach(myFunction);
    data.favorite_players.forEach(myFunctioFav);
    function myFunction(item: { cardtype: string }) {
        item.cardtype = 'CUSTOM';
    }

    function myFunctioFav(item: { cardtype: string }) {
        item.cardtype = 'FAVORITE';
    }
    return (
        <div className="flex justify-evenly w-full h-[532px] ">
            <div className="w-[150px] h-[532px]">
                <OptionsLeftContainer
                    player={data.current_player}
                    isOnline={data.isonline}
                    rankPoints={data.rankpoints}
                />
            </div>
            <div className="w-[418px] h-[532x] sm:w-[200px] md:w-[360px] lg:w-[520px] xl:w-[828px] 2xl:w-[984px]">
                <OptionsMiddleContainer
                    all_players={defaultPlayerArray.concat(
                        data.custom_players.concat(data.favorite_players)
                    )}
                />
            </div>
            <div className="w-[150px] h-[532px]">
                <OptionsRightContainer friendships={data.friendships} />
            </div>
        </div>
    );
}

export default Options;
