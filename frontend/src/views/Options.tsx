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
        <div className="flex justify-evenly gap-1 w-full h-[536px] border-2 border-purple-500">
            <div className="w-[148px] h-[528px]">
                <OptionsLeftContainer
                    player={data.current_player}
                    isOnline={data.isonline}
                    rankPoints={data.rankpoints}
                />
            </div>
            <div className="w-[418px] h-[528px]">
                <OptionsMiddleContainer players={data.custom_players} />
            </div>
            <div className="w-[148px] h-[528px]">
                <OptionsRightContainer friendships={data.friendships} />
            </div>
        </div>
    );
}

export default Options;
