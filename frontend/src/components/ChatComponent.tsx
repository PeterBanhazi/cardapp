import React, { useState, useEffect, useRef } from 'react';

interface PlayerState {
    id: string;
    username: string;
    channelId: string;
    isTyping: boolean;
    isReady: boolean;
    isSentMessage: boolean;
    lastTenMessages: string[];
    messageText: string;
}

interface IncomingMessage {
    type: string;
    payload: any;
}

interface OutgoingMessage {
    type: string;
    payload: any;
}

const ChatComponent: React.FC<{ username: string; channelId: string }> = ({
    username,
    channelId,
}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState>({
        id: '',
        username,
        channelId,
        isTyping: false,
        isReady: false,
        isSentMessage: false,
        lastTenMessages: [],
        messageText: '',
    });
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/game/');

        ws.onopen = () => {
            console.log('WebSocket connection established');
            ws.send(
                JSON.stringify({
                    type: 'join',
                    payload: { username, channelId },
                })
            );
        };

        ws.onmessage = (event) => {
            const message: IncomingMessage = JSON.parse(event.data);
            handleIncomingMessage(message);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [username, channelId]);

    const handleIncomingMessage = (message: IncomingMessage) => {
        const { type, payload } = message;

        switch (type) {
            case 'update':
                setPlayerState((prevState) => ({
                    ...prevState,
                    ...payload,
                }));
                break;
            case 'typing':
                setIsOtherTyping(payload.isTyping);
                break;
            case 'new_message':
                setPlayerState((prevState) => ({
                    ...prevState,
                    lastTenMessages: [
                        ...prevState.lastTenMessages,
                        payload.message,
                    ].slice(-10),
                }));
                break;
            default:
                console.log('Unknown message type:', type);
        }
    };

    const sendMessage = () => {
        if (socket && playerState.messageText.trim() !== '') {
            const outgoingMessage: OutgoingMessage = {
                type: 'new_message',
                payload: { message: playerState.messageText },
            };
            socket.send(JSON.stringify(outgoingMessage));

            setPlayerState((prevState) => ({
                ...prevState,
                isSentMessage: true,
                messageText: '',
            }));
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (socket) {
            socket.send(
                JSON.stringify({ type: 'typing', payload: { isTyping } })
            );
            setPlayerState((prevState) => ({
                ...prevState,
                isTyping,
            }));
        }
    };

    const toggleReadyState = () => {
        if (socket) {
            const newReadyState = !playerState.isReady;
            socket.send(
                JSON.stringify({
                    type: 'ready',
                    payload: { isReady: newReadyState },
                })
            );
            setPlayerState((prevState) => ({
                ...prevState,
                isReady: newReadyState,
            }));
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-gray-100 shadow-md rounded-lg">
            <h2 className="text-lg font-bold mb-4">Chat Room</h2>
            <div
                className="overflow-y-auto h-64 border border-gray-300 rounded p-4 mb-4"
                ref={chatWindowRef}
            >
                {playerState.lastTenMessages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        {msg}
                    </div>
                ))}
                {isOtherTyping && (
                    <div className="italic text-gray-500">
                        Another user is typing...
                    </div>
                )}
            </div>
            <input
                type="text"
                value={playerState.messageText}
                onChange={(e) =>
                    setPlayerState((prevState) => ({
                        ...prevState,
                        messageText: e.target.value,
                    }))
                }
                onFocus={() => handleTyping(true)}
                onBlur={() => handleTyping(false)}
                placeholder="Type a message..."
                className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
                onClick={sendMessage}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Send
            </button>
            <button
                onClick={toggleReadyState}
                className={`w-full p-2 mt-2 ${
                    playerState.isReady
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                } rounded`}
            >
                {playerState.isReady ? 'Ready' : 'Not Ready'}
            </button>
        </div>
    );
};

export default ChatComponent;
