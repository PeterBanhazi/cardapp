import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuthStore } from '../../store/useAuthStore';
const StatusList: React.FC = () => {
    // const accessToken = useAuthStore((state) => state.accessToken);
    const [messageHistory, setMessageHistory] = useState<string[]>([]);
    const accessToken = useAuthStore().accessToken;

    // Generate the WebSocket URL with the token as a query parameter
    const socketUrl = accessToken
        ? `ws://localhost:9000/ws/status/?token=${accessToken}`
        : null;

    console.log(accessToken);
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        // Only connect when we have a valid token
        shouldReconnect: (closeEvent) => {
            return !!accessToken;
        },
        reconnectAttempts: 5,
        reconnectInterval: 3000,
    });

    // Update message history when new messages arrive
    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => [...prev, lastMessage.data]);
        }
    }, [lastMessage]);

    // Map readyState to a connection status string
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    // Handler for sending a test message
    const handleSendMessage = () => {
        sendMessage(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    };

    if (!accessToken) {
        return <div>Not authenticated - please log in first</div>;
    }

    return (
        <div>
            <h2>WebSocket Status</h2>
            <p>Connection Status: {connectionStatus}</p>

            <button
                onClick={handleSendMessage}
                disabled={readyState !== ReadyState.OPEN}
            >
                Send Test Message
            </button>

            <div>
                <h3>Messages:</h3>
                <ul>
                    {messageHistory.map((message, idx) => (
                        <li key={idx}>{message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StatusList;
