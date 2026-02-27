import { useEffect, useRef, useState } from 'react';
import { ChatWebSocketManager, useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';

const ChatWindow: React.FC = () => {
    const {
        activeChatUser,
        chatConnections,
        sendChatMessage,
        closeChat,
        setActiveChatUser,
        markMessagesAsRead,
    } = useChatStore();
    const [messageInput, setMessageInput] = useState('');

    const loggedInUsername = useAuthStore.getState().user?.username;
    const activeChat = activeChatUser ? chatConnections[activeChatUser] : null;
    const activeChatTabs = Object.values(chatConnections).filter(
        (conn) => conn.isConnected
    );

    // const chatEndRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [chatMessages]);

    useEffect(() => {
        if (activeChatUser) {
            markMessagesAsRead(activeChatUser);
        }
    }, [activeChatUser, markMessagesAsRead]);

    const handleSendMessage = () => {
        if (messageInput.trim() && activeChatUser) {
            sendChatMessage(activeChatUser, messageInput.trim());
            setMessageInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCloseChat = (friendUser: string) => {
        const quitMessage = `${loggedInUsername} has left the chat...`;
        sendChatMessage(friendUser, quitMessage);
        closeChat(friendUser);
    };

    if (!activeChatUser || !activeChat) {
        return (
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                Select a friend to start chatting
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-96">
            {/* Chat Tabs */}

            {activeChatTabs.length > 1 && (
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {activeChatTabs.map((chat) => (
                        <button
                            key={chat.friendUser}
                            onClick={() => setActiveChatUser(chat.friendUser)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeChatUser === chat.friendUser
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {chat.friendUser}
                            {chat.unreadCount > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Header */}
            <ChatWebSocketManager friendUser={activeChatUser} />
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-3 h-3 rounded-full ${activeChat.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <h3 className="font-semibold text-gray-800">
                        {activeChatUser}
                    </h3>
                </div>
                <button
                    onClick={() => handleCloseChat(activeChatUser)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                    x
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChat.messages &&
                    activeChat.messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${
                                    message.sender === 'me'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {new Date(
                                        message.timestamp
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!activeChat.isConnected}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={
                            !messageInput.trim() || !activeChat.isConnected
                        }
                        className="bg-blue-500 text-white p-2 rounded-r-lg px-4 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
