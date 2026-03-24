import React from 'react';
import FriendListItem from '../../shared/components/ui/FriendListItem';
import InviteInput from '../../shared/components/ui/InviteInput';
import ScrollContainer from '../../shared/components/ui/ScrollContainer';
import { useFriendList } from './useFriendList';

import useFriendMutations from './useFriendMutations';

const OptionsRightContainer: React.FC = () => {
    const { data: friendships, isLoading, isError } = useFriendList();
    const {
        acceptRequestMutation,
        rejectRequestMutation,
        cancelOrDeleteRequestMutation,
        sendFriendRequestMutation,
    } = useFriendMutations();

    const handleChat = (username: string) => {
        // TODO: open chat with username
        console.log('chat with', username);
    };

    const handlePlay = (username: string) => {
        // TODO: invite username to game
        console.log('play with', username);
    };

    const handleInfo = (username: string) => {
        // TODO: open profile modal for username
        console.log('info for', username);
    };

    return (
        <div className="w-full h-full flex flex-col justify-between">
            <ScrollContainer
                headertext={<div>Friendships</div>}
                className="h-[316px]"
            >
                <div className="mt-0.5">
                    {isLoading && (
                        <p className="pl-2 py-1 text-xs text-slate-500">
                            Loading…
                        </p>
                    )}
                    {isError && (
                        <p className="pl-2 py-1 text-xs text-red-500">
                            Failed to load friends.
                        </p>
                    )}
                    {!isLoading &&
                        !isError &&
                        friendships.map((f) => (
                            <div
                                key={f.friend_req_id}
                                className="py-0.5 pl-1 pr-1"
                            >
                                <FriendListItem
                                    friendship={f}
                                    onAccept={(id) =>
                                        acceptRequestMutation.mutate(id)
                                    }
                                    onDecline={(id) =>
                                        rejectRequestMutation.mutate(id)
                                    }
                                    onCancel={(id) =>
                                        cancelOrDeleteRequestMutation.mutate(id)
                                    }
                                    onDelete={(id) =>
                                        cancelOrDeleteRequestMutation.mutate(id)
                                    }
                                    onChat={handleChat}
                                    onPlay={handlePlay}
                                    onInfo={handleInfo}
                                />
                            </div>
                        ))}
                </div>
            </ScrollContainer>

            <div>
                <InviteInput
                    onSubmit={(e) => {
                        sendFriendRequestMutation.mutate(e);
                    }}
                />
            </div>

            {/* <ScrollContainer
                headertext={<div>History</div>}
                className="h-[212px]"
            >
                {/* TODO: wire up match history data */}
            {/* </ScrollContainer> */}
        </div>
    );
};

export default OptionsRightContainer;
