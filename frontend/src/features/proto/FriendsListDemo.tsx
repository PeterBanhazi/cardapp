/**
 * FriendsListDemo.tsx  — wiring example
 * Shows how to: init the friends store, connect the socket,
 * and render ChatActionButton per friend.
 */

import React, { useEffect } from 'react';
import { useFriendsStore } from './friendsStore';
import { ChatActionButton } from './ChatActionButton';
import { useSystemSocket } from './useSystemSocket';
import { useAuthStore } from '@/core/store/useAuthStore';
import { WS_BASE_URL } from '@/core/utils/constants';
import { useOptionsDataTransformer } from '../options/useOptionsDataTransformer';

export function FriendsList() {
    const LOCAL_USER =
        useAuthStore((state) => state.user?.username) || 'test1test'; // replace with auth context
    const accessToken = useAuthStore().accessToken;
    const socketUrl = `${WS_BASE_URL}ws/system/?token=${accessToken}`;

    const { initFriends, friends, loaded } = useFriendsStore();
    const { sendAction } = useSystemSocket({
        url: socketUrl,
        username: LOCAL_USER,
    });

    const { data } = useOptionsDataTransformer();
    // Populate friends once from your REST endpoint
    useEffect(() => {
        if (data) {
            initFriends(data.friendships);
        }
    }, [initFriends, data]);

    if (!loaded) return <p>Loading friends…</p>;

    return (
        <ul>
            {Object.values(friends).map((friend) => (
                <li
                    key={friend.friend_username}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 0',
                    }}
                >
                    <span
                        style={{
                            opacity: friend.status === 'online' ? 1 : 0.4,
                        }}
                    >
                        {friend.status === 'online' ? '●' : '○'}
                    </span>
                    <span>{friend.display_name ?? friend.friend_username}</span>
                    <ChatActionButton
                        friendUsername={friend.friend_username}
                        localUser={LOCAL_USER}
                        sendAction={sendAction}
                    />
                </li>
            ))}
        </ul>
    );
}
