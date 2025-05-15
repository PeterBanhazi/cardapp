import React, { useEffect } from 'react';
import FriendsList from './FriendsList';
import ChatWindow from './ChatWindow';
import { useAuthStore } from '../../store/useAuthStore';
import { useStatusStore, useStatusWebSocket } from '../../store/useStatusStore';
import { api } from '../../store/useAuthStore';

const ChatApp: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { connect } = useStatusStore();

    // Initialize WebSocket connection for status
    useStatusWebSocket();

    // Fetch initial friend status list
    useEffect(() => {
        const loadFriendsStatus = async () => {
            try {
                const response = await api.get('chat/friends/status/');
                useStatusStore
                    .getState()
                    .initializeFriendsStatus(response.data);
            } catch (error) {
                console.error('Failed to load friends status:', error);
            }
        };

        connect(); // Connect to status WebSocket
        loadFriendsStatus();

        return () => {
            useStatusStore.getState().disconnect();
        };
    }, [connect]);

    return (
        <div className="chat-app">
            <header className="chat-header">
                <h1>Chat App</h1>
                <div className="user-info">
                    <span>Logged in as: {user?.username}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div className="chat-container">
                <FriendsList />
                <ChatWindow />
            </div>
        </div>
    );
};

export default ChatApp;
