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

    const { isPending, isError, data, error } = useQuery({
        queryKey: ['userproperties'],
        queryFn: fetchUserProperties,
    });
    if (isPending) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }
    console.log(data);

    return (
        <div className="flex justify-evenly w-full h-[532px] ">
            <div className="w-[148px] h-[532px]">
                <OptionsLeftContainer
                    player={data.current_player}
                    isOnline={data.isonline}
                    rankPoints={data.rankpoints}
                />
            </div>
            <div className="w-[418px] h-[532x] sm:w-[200px] md:w-[352px] lg:w-[656px] xl:w-[812px] 2xl:w-[1112px]">
                <OptionsMiddleContainer
                    all_players={data.custom_players.concat(
                        data.favorite_players
                    )}
                />
            </div>
            <div className="w-[148px] h-[532px]">
                <OptionsRightContainer friendships={data.friendships} />
            </div>
        </div>
    );
}

export default Options;
