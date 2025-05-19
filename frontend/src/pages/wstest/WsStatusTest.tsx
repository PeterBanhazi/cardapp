import { useWebSocketState } from '../../store/wsHooks';
import { useAuthStore } from '../../store/useAuthStore';

export default function WsStatusTest() {
    const { isConnected, messages, lastMessage, sendMessage } =
        useWebSocketState();

    const handleSendMessage = () => {
        console.log(messages);
        // Example of sending a structured message
        sendMessage({
            type: 'chat',
            payload: {
                message: 'Hello from client!',
                timestamp: new Date().toISOString(),
            },
        });
    };

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold mb-4">WebSocket Example</h2>

            <div className="mb-4">
                <p className="mb-2">
                    Connection Status:
                    <span
                        className={`ml-2 font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </p>

                <button
                    onClick={handleSendMessage}
                    disabled={!isConnected}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Send Test Message
                </button>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Last Message:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                    {lastMessage
                        ? JSON.stringify(lastMessage, null, 2)
                        : 'No messages yet'}
                </pre>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Message History:</h3>
                <div className="max-h-40 overflow-y-auto bg-gray-100 p-2 rounded">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-2 text-sm">
                                <span className="font-medium">{msg.type}:</span>{' '}
                                {JSON.stringify(msg)}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">
                            No messages received yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
