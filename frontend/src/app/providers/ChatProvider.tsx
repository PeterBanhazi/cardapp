import React, { useEffect, useRef, createContext, useContext } from 'react';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useChatStore } from '../../core/store/useChatStore';
import { ChatWebSocketManager } from '../../core/store/useChatStore';

// Chat Provider Context
const ChatProviderContext = createContext<{}>({});

// Main Chat Provider Component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { chatConnections, clearAllStoredMessages } = useChatStore();
    const chatConnectionsRef = useRef<Record<string, boolean>>({});
    const { isAuthenticated } = useAuthStore();

    // Track which connections are currently active
    useEffect(() => {
        const currentConnections = Object.keys(chatConnections);
        const previousConnections = Object.keys(chatConnectionsRef.current);

        // Update the ref
        chatConnectionsRef.current = currentConnections.reduce(
            (acc, friendUser) => {
                acc[friendUser] = true;
                return acc;
            },
            {} as Record<string, boolean>
        );

        // Log connection changes for debugging
        const newConnections = currentConnections.filter(
            (user) => !previousConnections.includes(user)
        );
        const removedConnections = previousConnections.filter(
            (user) => !currentConnections.includes(user)
        );

        if (newConnections.length > 0) {
            console.log('New chat connections:', newConnections);
        }
        if (removedConnections.length > 0) {
            console.log('Removed chat connections:', removedConnections);
        }
    }, [chatConnections]);

    // Clear all stored messages when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            clearAllStoredMessages();
        }
    }, [isAuthenticated, clearAllStoredMessages]);

    // Cleanup on page unload/refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Messages will persist in localStorage for refresh
            // They'll only be cleared on logout or manual chat close
        };

        const handleUnload = () => {
            // Optional: Clear messages on browser close
            // Uncomment the line below if you want to clear messages when browser closes
            // clearAllStoredMessages();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [clearAllStoredMessages]);

    return (
        <ChatProviderContext.Provider value={{}}>
            {children}
            {/* Render WebSocket managers for each active chat connection */}
            {Object.keys(chatConnections).map((friendUser) => (
                <ChatWebSocketManager
                    key={friendUser}
                    friendUser={friendUser}
                />
            ))}
        </ChatProviderContext.Provider>
    );
};

// Hook to use chat provider context (if needed for future extensions)
export const useChatProvider = () => {
    const context = useContext(ChatProviderContext);
    if (context === undefined) {
        throw new Error('useChatProvider must be used within a ChatProvider');
    }
    return context;
};
