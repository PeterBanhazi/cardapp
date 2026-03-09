import { useChatStore } from '@/core/store/useChatStore';
import { useFriendsStore } from '@/core/store/useFriendsStore';
import { useMemo } from 'react';

export const ChatRequestButton: React.FC<{
    friendUser: string;
}> = ({ friendUser }) => {
    const {
        sendChatRequest,
        sendAcceptChatRequest,
        sendCancelledChat,
        sendRejectChatRequest,
        sendClosedChat,
        isConnected,
        friends,
    } = useFriendsStore();
    const { activeChatUser, setActiveChatUser, openChat, closeChat } =
        useChatStore();

    const status = useMemo(() => {
        const searchFriend = Object.values(friends).filter(
            (friend) => friend.user === friendUser
        );
        return friendUser ? searchFriend[0].status : 'offline';
    }, [friends, friendUser]);

    const handleSendRequest = (actinon?: string) => {
        if (status === 'pending') {
            sendAcceptChatRequest(friendUser);
            openChat(friendUser);
            setActiveChatUser(friendUser);
            return;
        }
        if (status === 'active') {
            setActiveChatUser(friendUser);
        }
        sendChatRequest(friendUser);
    };

    const getButtonConfig = () => {
        switch (status) {
            case 'online':
                return {
                    text: 'Chat',
                    styles: 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer',
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
                    styles: 'bg-yellow-400 text-yellow-800 cursor-pointer',
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
                    styles: 'bg-green-500 hover:bg-green-600 text-white cursor-pointer',
                    disabled: false,
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    styles: 'bg-green-500 hover:bg-green-600 text-white cursor-not-allowed',
                    disabled: true,
                };
            case 'cancelled':
                return {
                    text: 'Cancelled',
                    styles: 'bg-green-500 hover:bg-green-600 text-white',
                    disabled: false,
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
        <div>
            <button
                onClick={() => handleSendRequest()}
                disabled={config.disabled || !isConnected}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${config.styles} ${
                    !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {config.text}
            </button>

            {status === 'pending' && (
                <button
                    onClick={() => sendRejectChatRequest(friendUser)}
                    disabled={config.disabled || !isConnected}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors bg-red-500 hover:bg-red-600 text-white} ${
                        !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {'Reject'}
                </button>
            )}
        </div>
    );
};
