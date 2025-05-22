import React, { useState, useEffect, useRef } from 'react';
import { useWebSocketState } from '../../store/wsHooks';
import useWebSocketChat from './useWebSocketChat';

interface Friend {
    user: string;
    status: 'online' | 'offline';
}

interface ChatMessage {
    type: 'message';
    message: string;
    sender: string;
    timestamp: string;
}

const ChatWindow: React.FC = () => {
    // Main WebSocket connection for friends list
    const { isConnected, messages } = useWebSocketState();

    // Get friends list from messages
    const friends = messages
        .filter(
            (msg): msg is { type: 'status'; user: string; status: string } =>
                msg.type === 'status' && 'user' in msg && 'status' in msg
        )
        .map((msg) => ({
            user: msg.user,
            status: msg.status as 'online' | 'offline',
        }));

    // State for active chat
    const [activeFriend, setActiveFriend] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Custom hook for chat-specific WebSocket connection
    const {
        connected: chatConnected,
        messages: chatMessages,
        sendMessage: sendChatMessage,
    } = useWebSocketChat(activeFriend);

    // Handle clicking on a friend
    const handleFriendClick = (friend: Friend) => {
        if (friend.status === 'online') {
            setActiveFriend(friend.user);
        }
    };

    // Handle sending a message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (inputMessage.trim() && activeFriend) {
            sendChatMessage({
                type: 'message',
                message: inputMessage,
                sender: 'me', // Assuming 'me' is the current user identifier
            });

            setInputMessage('');
        }
    };

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    return (
        <div className="flex h-[400px] w-[520px]  rounded-lg overflow-hidden shadow-lg border border-gray-200">
            {/* Friends List - Left Side */}
            <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Friends
                    </h2>
                    <p className="text-sm text-gray-500">
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </p>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {friends.length === 0 ? (
                        <p className="text-gray-500 text-sm p-4">
                            No friends available
                        </p>
                    ) : (
                        <ul>
                            {friends.map((friend) => (
                                <li
                                    key={friend.user}
                                    onClick={() => handleFriendClick(friend)}
                                    className={`
                    flex items-center p-3 hover:bg-gray-100 transition-colors
                    ${friend.status === 'offline' ? 'cursor-default text-gray-500' : 'cursor-pointer'}
                    ${activeFriend === friend.user ? 'bg-blue-50' : ''}
                  `}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full mr-3 
                      ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}
                                    />
                                    <span className="font-medium">
                                        {friend.user}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Chat Area - Right Side */}
            <div className="w-3/4 flex flex-col bg-white">
                {activeFriend ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-3 bg-green-500`}
                            />
                            <h2 className="text-lg font-semibold">
                                {activeFriend}
                            </h2>
                            <span className="ml-2 text-sm text-gray-500">
                                {chatConnected ? 'Connected' : 'Connecting...'}
                            </span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                            {chatMessages.length === 0 ? (
                                <p className="text-center text-gray-500 mt-6">
                                    No messages yet. Say hello!
                                </p>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`mb-4 max-w-md ${msg.sender === 'me' ? 'ml-auto' : ''}`}
                                    >
                                        <div
                                            className={`p-3 rounded-lg ${
                                                msg.sender === 'me'
                                                    ? 'bg-blue-500 text-white rounded-br-none'
                                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {msg.message}
                                        </div>
                                        <div
                                            className={`text-xs mt-1 text-gray-500 ${
                                                msg.sender === 'me'
                                                    ? 'text-right'
                                                    : ''
                                            }`}
                                        >
                                            {msg.timestamp &&
                                                new Date(
                                                    msg.timestamp
                                                ).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t border-gray-200 flex items-center"
                        >
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) =>
                                    setInputMessage(e.target.value)
                                }
                                placeholder="Type a message..."
                                className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="submit"
                                disabled={
                                    !chatConnected || !inputMessage.trim()
                                }
                                className="bg-blue-500 text-white p-2 rounded-r-lg px-4 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select an online friend to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
