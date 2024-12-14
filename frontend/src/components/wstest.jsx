import React, { useState, useEffect } from 'react';

const WebSocketChat = () => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [wsUserId, setWsUserId] = useState('');

    useEffect(() => {
        // Initialize the WebSocket connection
        const ws = new WebSocket('ws://localhost:8000/ws/game/');

        // Set up event handlers
        ws.onopen = () => {
            console.log('WebSocket connection established');
            if (receivedMessage['type'] === 'playerId') {
                setWsUserId(receivedMessage['playerId']);
                console.log('succes');
            }
        };

        ws.onmessage = (event) => {
            const receivedMessage = event.data;

            setChatLog((prevLog) => [
                ...prevLog,
                {
                    type: 'received',
                    messageText: receivedMessage,
                },
            ]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Save the WebSocket instance
        setSocket(ws);

        // Cleanup function to close the WebSocket connection
        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket && message.trim() !== '') {
            socket.send(
                JSON.stringify({
                    type: 'isSentMessage',
                    messageText: message,
                })
            );
            setChatLog((prevLog) => [
                ...prevLog,
                { type: 'sent', messageText: message },
            ]);

            setMessage('');
        }
    };

    return (
        <div
            style={{
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                border: '1px solid #ccc',
                borderRadius: '8px',
            }}
        >
            <h2>WebSocket Chat</h2>
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    height: '300px',
                    overflowY: 'scroll',
                    marginBottom: '10px',
                }}
            >
                {chatLog.map((log, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: log.type === 'sent' ? 'right' : 'left',
                            margin: '5px 0',
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor:
                                log.type === 'sent' ? '#d4edda' : '#f8d7da',
                        }}
                    >
                        {log.messageText}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    style={{
                        flexGrow: 1,
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default WebSocketChat;
