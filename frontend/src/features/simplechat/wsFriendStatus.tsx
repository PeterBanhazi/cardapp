import { useMemo } from 'react';
import { useFriendsStore } from '../../core/store/useFriendsStore';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useChatStore } from '../../core/store/useChatStore';
import { Friend } from '@/shared/types/friend';
import { useSelectedUser } from '@/features/lobbychat/store/useSelectedUser';

export const StatusBadge: React.FC<{ status: Friend['status'] }> = ({
    status,
}) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'offline':
                return 'bg-gray-400';
            case 'pending':
                return 'bg-yellow-500';
            case 'active':
                return 'bg-green-100';
            case 'closed':
                return 'bg-red-500';
            case 'cancelled':
                return 'bg-red-200';
            case 'rejected':
                return 'bg-red-200';
            default:
                return 'bg-gray-400';
        }
    };

    return <div className={`w-3 h-3 rounded-full ${getStatusStyles()}`} />;
};

// Request Button Component
export const RequestButton: React.FC<{
    friendUser: string;
    status: Friend['status'];
}> = ({ friendUser, status }) => {
    const { sendChatRequest, isConnected } = useFriendsStore();
    const { activeChatUser, setActiveChatUser } = useChatStore();
    const { selectedUser } = useSelectedUser();

    const handleSendRequest = () => {
        if (status === 'pending') {
            setActiveChatUser(friendUser);
            return;
        }
        sendChatRequest(friendUser);
    };

    const getButtonConfig = () => {
        switch (status) {
            case 'online':
                return {
                    text: 'Chat',
                    styles: 'bg-blue-500 hover:bg-blue-600 text-white',
                    disabled: false,
                };
            case 'offline':
                return {
                    text: 'Offline',
                    styles: 'bg-gray-300 text-gray-500 cursor-not-allowed',
                    disabled: true,
                };
            case 'pending':
                return {
                    text: 'Pending',
                    styles: 'bg-yellow-400 text-yellow-800 cursor-not-allowed',
                    disabled: false,
                };
            case 'active':
                return {
                    text: 'Active',
                    styles: 'bg-green-400 text-yellow-800 cursor-not-allowed',
                    disabled: false,
                };
            case 'closed':
                return {
                    text: 'Reconnect',
                    styles: 'bg-green-500 hover:bg-green-600 text-white',
                    disabled: false,
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    styles: 'bg-green-500 hover:bg-green-600 text-white',
                    disabled: true,
                };
            case 'cancelled':
                return {
                    text: 'Cancelled',
                    styles: 'bg-green-500 hover:bg-green-600 text-white',
                    disabled: true,
                };
            default:
                return {
                    text: 'Chat',
                    styles: 'bg-gray-300 text-gray-500 cursor-not-allowed',
                    disabled: true,
                };
        }
    };

    const config = getButtonConfig();

    return (
        <button
            onClick={handleSendRequest}
            disabled={config.disabled || !isConnected}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${config.styles} ${
                !isConnected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {config.text}
        </button>
    );
};

export const FriendsList: React.FC = () => {
    const { friends, isConnected, sendAcceptChatRequest } = useFriendsStore();
    const { openChat, getUnreadCount } = useChatStore();
    const loggedInUsername = useAuthStore.getState().user?.username;
    const friendsLista = Object.values(friends);

    const friendsList = useMemo(() => {
        // Create a map to store the latest status for each user
        const userStatusMap = new Map<
            string,
            | 'pending'
            | 'active'
            | 'online'
            | 'closed'
            | 'offline'
            | 'rejected'
            | 'cancelled'
        >();

        // Process all status messages to get the latest status for each user

        friendsLista.forEach((friend) => {
            userStatusMap.set(
                friend.user,
                friend.status as 'online' | 'offline'
            );
        });

        // Convert map to array and filter out logged-in user
        return Array.from(userStatusMap.entries())
            .filter(([username]) => username !== loggedInUsername)
            .map(([user, status]) => ({ user, status }));
    }, [friends, loggedInUsername]);

    const handleFriendClick = (friend: Friend) => {
        if (friend.status === 'pending') {
            console.log(friend.user);
            // Accept the chat request
            openChat(friend.user);
            sendAcceptChatRequest(friend.user);
        } else if (friend.status === 'active' || friend.status === 'online') {
            // Open existing chat
            openChat(friend.user);
            console.log('autoopen: ' + friend.user);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Friends
                    </h2>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        />
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {friendsList.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {isConnected ? 'No friends online' : 'Connecting...'}
                    </div>
                ) : (
                    friendsList.map((friend) => {
                        const unreadCount = getUnreadCount(friend.user);
                        const isClickable =
                            friend.status === 'pending' ||
                            friend.status === 'active' ||
                            friend.status === 'online';

                        return (
                            <div
                                key={friend.user}
                                className={`flex items-center justify-between p-3 border-b border-gray-100 transition-colors ${
                                    isClickable
                                        ? 'hover:bg-gray-50 cursor-pointer'
                                        : ''
                                }`}
                                onClick={() =>
                                    isClickable && handleFriendClick(friend)
                                }
                            >
                                <div className="flex items-center space-x-3">
                                    <StatusBadge status={friend.status} />
                                    <span className="font-medium text-gray-800">
                                        {friend.user}
                                    </span>
                                    {/* <StatusText status={friend.status} />
                  <UnreadBadge count={unreadCount} /> */}
                                </div>
                                <RequestButton
                                    friendUser={friend.user}
                                    status={friend.status}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Connection Status Component
export const ConnectionStatus: React.FC = () => {
    const { isConnected } = useFriendsStore();

    return (
        <div className="mb-4 p-3 rounded-lg bg-gray-100">
            <div className="flex items-center space-x-2">
                <div
                    className={`w-3 h-3 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                />
                <span className="text-sm font-medium">
                    WebSocket Status:{' '}
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
};

// Debug Panel Component
export const DebugPanel: React.FC = () => {
    const { friends } = useFriendsStore();

    return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Debug Info
            </h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(friends, null, 2)}
            </pre>
        </div>
    );
};
