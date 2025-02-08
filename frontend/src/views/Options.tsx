import useAxios from '../utils/useAxios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from 'flowbite-react';
import { Switch } from 'radix-ui';
import * as React from 'react';
import TennisPlayerCards from '../components/TennisPlayerCards';
import TennisPlayerCreator from '../components/TennisPlayerCreator';
import { useState } from 'react';
interface PlayerStats {
    id: number;
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

interface Friendship {
    friend_username: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
}

interface UserData {
    username: string;
    isonline: boolean;
    rankpoints: number;
    friendships: Friendship;
    favorite_players: PlayerStats[];
    current_player: PlayerStats[];
    custom_players: PlayerStats[];
}

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

    // Update User Properties
    // const updateUserProperties = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         setSuccessMessage(null);

    //         const response = await api.post('options/', userProperties);

    //         setSuccessMessage('User properties updated successfully.');
    //     } catch (err) {
    //         setError('Failed to update user properties.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const OptionsLeftContainer: React.FC<{
        player: PlayerStats;
        isOnline: boolean;
        rankPoints: number;
    }> = ({ player, isOnline, rankPoints }) => {
        const [isCreateOpen, setIsCreateOpen] = useState(false);
        return (
            <div className="w-full h-full p-1 flex flex-col gap-1 items-center justify-start bg-transparent border">
                <div className="text-lg font-semibold">
                    Rank Points: {rankPoints}
                </div>

                <div>
                    <form>
                        <div className="flex items-center">
                            <label
                                className={`pr-[15px] text-sm leading-none font-bold
            ${isOnline ? 'text-green-400' : 'text-gray-700'}`}
                                htmlFor="online-mode"
                            >
                                {isOnline ? 'Online' : 'Go Online!'}
                            </label>
                            <Switch.Root
                                className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-green-500"
                                id="online-mode"
                                checked={isOnline}
                                onCheckedChange={() => {
                                    console.log('yes');
                                }}
                                style={{
                                    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
                                }}
                            >
                                <Switch.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
                            </Switch.Root>
                        </div>
                    </form>
                </div>
                <div>
                    <div className="relative"></div>
                    <TennisPlayerCards players={[player]} />

                    <div className="flex flex-row justify-self-center">
                        <button className="bg-slate-400 ">Option1</button>

                        <button>Option2</button>
                    </div>
                    <div>
                        <button
                            className="flex rounded-xl border-2 justify-self-center"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            Create
                        </button>
                        {isCreateOpen && (
                            <TennisPlayerCreator
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const OptionsMiddleContainer: React.FC<{
        players: PlayerStats[];
    }> = ({ players }) => (
        <div className="w-full h-full p-4 overflow-y-auto border-2">
            <h3 className="text-lg font-semibold mb-4">Custom Players</h3>

            <TennisPlayerCards players={players} />
        </div>
    );

    // Right component for friendships
    const OptionsRightContainer: React.FC<{
        friendships: Friendship[];
    }> = ({ friendships }) => (
        <div className="w-full h-full p-1 border overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Friendships</h3>
            <div className="pb-3">
                <form action="/action_page.php" id="inviteform" className="">
                    <input
                        type="text"
                        name="inviteform"
                        placeholder="Invite friend"
                        className="w-[138px]"
                    />
                    <input type="submit" value="Send Request" />
                </form>
            </div>
            {friendships.map((friend) => (
                <div
                    key={friend.friend_username}
                    className={`flex items-center flex-column text-sm font-semibold mb-2 pb-2 border-b ${
                        friend.status === `PENDING`
                            ? 'bg-yellow-500'
                            : friend.status === 'ACCEPTED'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                    }`}
                >
                    <div>
                        <span>{friend.friend_username}</span>
                        {friend.status === `PENDING` ? (
                            <div> Accept Reject:</div>
                        ) : (
                            <div>Chat Play Del Info</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

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
