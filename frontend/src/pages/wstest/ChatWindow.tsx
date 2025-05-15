import React, { useState, useEffect, useRef } from 'react';
import { useChatStore, useChatWebSocket } from '../../store/useChatStore';
import { useStatusStore } from '../../store/useStatusStore';
import { useAuthStore } from '../../store/useAuthStore';

const ChatWindow: React.FC = () => {
    // const [inputMessage, setInputMessage] = useState('');
    // const messagesEndRef = useRef<HTMLDivElement>(null);
    // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // const activeChat = useChatStore((state) => state.activeChat);
    // const messages = useChatStore((state) =>
    //     activeChat ? state.messages[activeChat] || [] : []
    // );
    // const isTyping = useChatStore((state) =>
    //     activeChat ? state.isTyping[activeChat] || false : false
    // );
    // const friendStatus = useStatusStore((state) =>
    //     activeChat ? state.friendsStatus[activeChat] : null
    // );
    // const currentUsername = useAuthStore((state) => state.user?.username);

    // const { sendMessage, sendTypingStatus } = useChatWebSocket();

    // // Scroll to bottom of messages
    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [messages]);

    // const handleSendMessage = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!inputMessage.trim() || !activeChat) return;

    //     sendMessage(inputMessage);
    //     setInputMessage('');

    //     // Clear typing indicator
    //     if (typingTimeoutRef.current) {
    //         clearTimeout(typingTimeoutRef.current);
    //         typingTimeoutRef.current = null;
    //     }
    //     sendTypingStatus(false);
    // };

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setInputMessage(e.target.value);

    //     // Handle typing indicator
    //     if (!typingTimeoutRef.current) {
    //         sendTypingStatus(true);
    //     } else {
    //         clearTimeout(typingTimeoutRef.current);
    //     }

    //     // Set timeout to clear typing indicator after 2 seconds of inactivity
    //     typingTimeoutRef.current = setTimeout(() => {
    //         sendTypingStatus(false);
    //         typingTimeoutRef.current = null;
    //     }, 2000);
    // };

    // if (!activeChat) {
    //     return (
    //         <div className="chat-window empty-state">
    //             <p>Select a friend to start chatting</p>
    //         </div>
    //     );
    // }

    return (
        <div className="chat-window">
            {/* <div className="chat-header">
                <h3>{activeChat}</h3>
                <div
                    className={`status-indicator ${friendStatus?.isOnline ? 'online' : 'offline'}`}
                >
                    {friendStatus?.isOnline ? 'Online' : 'Offline'}
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`message ${msg.sender === currentUsername ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">{msg.content}</div>
                            <div className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="typing-indicator">
                        {activeChat} is typing...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                />
                <button type="submit" disabled={!inputMessage.trim()}>
                    Send
                </button>
            </form> */}
        </div>
    );
};

export default ChatWindow;
