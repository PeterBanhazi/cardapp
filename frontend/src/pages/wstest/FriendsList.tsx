import React from 'react';
import { useStatusStore } from '../../store/useStatusStore';
import { useChatStore } from '../../store/useChatStore';

const FriendsList: React.FC = () => {
    // const friendsStatus = useStatusStore((state) => state.friendsStatus);
    // const { activeChat, setActiveChat, unreadCounts } = useChatStore();

    // const sortedFriends = Object.values(friendsStatus).sort((a, b) => {
    //     // Sort online friends first
    //     if (a.isOnline && !b.isOnline) return -1;
    //     if (!a.isOnline && b.isOnline) return 1;
    //     // Then sort by username
    //     return a.username.localeCompare(b.username);
    // });

    return (
        <div className="friends-list">
            <h2>Friends</h2>
            {/* <ul>
                {sortedFriends.length === 0 && (
                    <li className="no-friends">No friends available</li>
                )}

                {sortedFriends.map((friend) => (
                    <li
                        key={friend.username}
                        className={`friend-item ${activeChat === friend.username ? 'active' : ''}`}
                        onClick={() => setActiveChat(friend.username)}
                    >
                        <div
                            className={`status-indicator ${friend.isOnline ? 'online' : 'offline'}`}
                        />
                        <div className="friend-info">
                            <span className="friend-name">
                                {friend.username}
                            </span>
                            {unreadCounts[friend.username] > 0 && (
                                <span className="unread-badge">
                                    {unreadCounts[friend.username]}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default FriendsList;
