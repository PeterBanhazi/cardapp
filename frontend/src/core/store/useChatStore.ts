import React, { useEffect} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { create } from 'zustand';
import { WS_BASE_URL } from '../utils/constants';
import { useAuthStore } from './useAuthStore';

// Types
interface ChatMessage {
    type: string;
    message: string;
    sender: string;
    timestamp: string;
}

interface ChatConnection {
    friendUser: string;
    isConnected: boolean;
    sendMessage: ((message: string) => void) | null;
    messages: ChatMessage[];
    unreadCount: number;
}

interface ChatState {
    chatConnections: Record<string, ChatConnection>;
    activeChatUser: string | null;
    maxConnections: number;
    
    openChat: (friendUser: string) => void;
    closeChat: (friendUser: string) => void;
    setActiveChatUser: (friendUser: string | null) => void;
    setChatConnection: (friendUser: string, connection: Partial<ChatConnection>) => void;
    addMessage: (friendUser: string, message: ChatMessage) => void;
    markMessagesAsRead: (friendUser: string) => void;
    sendChatMessage: (friendUser: string, message: string) => void;
    clearAllChats: () => void;
    getUnreadCount: (friendUser: string) => number;
    loadMessagesFromStorage: (friendUser: string) => ChatMessage[];
    saveMessagesToStorage: (friendUser: string, messages: ChatMessage[]) => void;
    removeMessagesFromStorage: (friendUser: string) => void;
    clearAllStoredMessages: () => void;
}

// Storage utilities
const CHAT_STORAGE_PREFIX = 'chat_messages_';

const getStorageKey = (friendUser: string) => `${CHAT_STORAGE_PREFIX}${friendUser}`;

const loadMessagesFromLocalStorage = (friendUser: string): ChatMessage[] => {
    try {
        const stored = localStorage.getItem(getStorageKey(friendUser));
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading messages from storage:', error);
        return [];
    }
};

const saveMessagesToLocalStorage = (friendUser: string, messages: ChatMessage[]) => {
    try {
        localStorage.setItem(getStorageKey(friendUser), JSON.stringify(messages));
    } catch (error) {
        console.error('Error saving messages to storage:', error);
    }
};

const removeMessagesFromLocalStorage = (friendUser: string) => {
    try {
        localStorage.removeItem(getStorageKey(friendUser));
    } catch (error) {
        console.error('Error removing messages from storage:', error);
    }
};

const clearAllStoredMessages = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CHAT_STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Error clearing all stored messages:', error);
    }
};

// Enhanced Chat Store
export const useChatStore = create<ChatState>((set, get) => ({
    chatConnections: {},
    activeChatUser: null,
    maxConnections: 10,
    
    loadMessagesFromStorage: (friendUser: string) => {
        return loadMessagesFromLocalStorage(friendUser);
    },
    
    saveMessagesToStorage: (friendUser: string, messages: ChatMessage[]) => {
        saveMessagesToLocalStorage(friendUser, messages);
    },
    
    removeMessagesFromStorage: (friendUser: string) => {
        removeMessagesFromLocalStorage(friendUser);
    },
    
    clearAllStoredMessages: () => {
        clearAllStoredMessages();
    },
    
    openChat: (friendUser: string) => {
        const { chatConnections, maxConnections } = get();
        
        // Check if already exists
        if (chatConnections[friendUser]) {
            set({ activeChatUser: friendUser });
            get().markMessagesAsRead(friendUser);
            return;
        }
        
        // Check max connections
        const activeConnections = Object.keys(chatConnections).length;
        if (activeConnections >= maxConnections) {
            console.warn('Maximum chat connections reached');
            return;
        }
        
        // Load messages from localStorage
        const storedMessages = loadMessagesFromLocalStorage(friendUser);
        
        set((state) => ({
            chatConnections: {
                ...state.chatConnections,
                [friendUser]: {
                    friendUser,
                    isConnected: false,
                    sendMessage: null,
                    messages: storedMessages,
                    unreadCount: 0,
                },
            },
            activeChatUser: friendUser,
        }));
    },
    
    closeChat: (friendUser: string) => {
        set((state) => {
            const newConnections = { ...state.chatConnections };
            delete newConnections[friendUser];
            
            // Remove messages from localStorage when chat is closed
            removeMessagesFromLocalStorage(friendUser);
            
            return {
                chatConnections: newConnections,
                activeChatUser: state.activeChatUser === friendUser ? null : state.activeChatUser,
            };
        });
    },
    
    setActiveChatUser: (friendUser: string | null) => {
        set({ activeChatUser: friendUser });
        if (friendUser) {
            get().markMessagesAsRead(friendUser);
        }
    },
    
    setChatConnection: (friendUser: string, connection: Partial<ChatConnection>) => {
        set((state) => ({
            chatConnections: {
                ...state.chatConnections,
                [friendUser]: {
                    ...state.chatConnections[friendUser],
                    ...connection,
                },
            },
        }));
    },
    
    addMessage: (friendUser: string, message: ChatMessage) => {
        set((state) => {
            const currentConnection = state.chatConnections[friendUser];
            if (!currentConnection) return state;
            
            const newMessages = [...currentConnection.messages, message];
            const isActiveChat = state.activeChatUser === friendUser;
            const unreadCount = isActiveChat ? 0 : currentConnection.unreadCount + 1;
            
            // Save to localStorage
            saveMessagesToLocalStorage(friendUser, newMessages);
            
            return {
                chatConnections: {
                    ...state.chatConnections,
                    [friendUser]: {
                        ...currentConnection,
                        messages: newMessages,
                        unreadCount,
                    },
                },
            };
        });
    },
    
    markMessagesAsRead: (friendUser: string) => {
        set((state) => {
            const currentConnection = state.chatConnections[friendUser];
            if (!currentConnection) return state;
            
            return {
                chatConnections: {
                    ...state.chatConnections,
                    [friendUser]: {
                        ...currentConnection,
                        unreadCount: 0,
                    },
                },
            };
        });
    },
    
    sendChatMessage: (friendUser: string, message: string) => {
        const { chatConnections } = get();
        const connection = chatConnections[friendUser];
        
        if (connection?.sendMessage && connection.isConnected) {
            const chatMessage = {
                type: "message",
                message: message,
                sender: useAuthStore.getState().user?.username!,
                timestamp: new Date().toISOString(),
            };
            
            connection.sendMessage(JSON.stringify(chatMessage));
            
            // Add to local messages if you want to improve ux and
            // mess around message id sync, the message is saved either way
            
            // get().addMessage(friendUser, chatMessage);
        }
    },
    
    clearAllChats: () => {
        // Clear all stored messages when clearing all chats
        clearAllStoredMessages();
        
        set({
            chatConnections: {},
            activeChatUser: null,
        });
    },
    
    getUnreadCount: (friendUser: string) => {
        const { chatConnections } = get();
        return chatConnections[friendUser]?.unreadCount || 0;
    },
}));

// Individual WebSocket Manager for each friend
export const ChatWebSocketManager: React.FC<{ friendUser: string }> = ({ friendUser }) => {
    const { setChatConnection, addMessage } = useChatStore();
    const accessToken = useAuthStore().accessToken;
    const wsUrl = friendUser ? `${WS_BASE_URL}ws/chat/${friendUser}/?token=${accessToken}` : null;
    
    const { lastMessage, readyState, sendMessage } = useWebSocket(
        wsUrl,
        {
            onOpen: () => {
                console.log(`Chat WebSocket opened for ${friendUser}`);
                setChatConnection(friendUser, { isConnected: true });
                
                const chatMessage = {
                    type: "message",
                    message: `${useAuthStore.getState().user?.username} has joined the chat...`,
                    sender: useAuthStore.getState().user?.username!,
                    timestamp: new Date().toISOString(),
                };
                
                sendMessage(JSON.stringify(chatMessage));
            },
            onClose: () => {
                console.log(`Chat WebSocket closed for ${friendUser}`);
                setChatConnection(friendUser, { isConnected: false, sendMessage: null });
            },
            onError: (error) => {
                console.error(`Chat WebSocket error for ${friendUser}:`, error);
                setChatConnection(friendUser, { isConnected: false });
            },
            shouldReconnect: () => true,
            reconnectInterval: 3000,
        }
    );

    // Set the sendMessage function
    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            setChatConnection(friendUser, { sendMessage });
        } else {
            setChatConnection(friendUser, { sendMessage: null });
        }
    }, [readyState, sendMessage, friendUser, setChatConnection]);

    // Handle connection state
    useEffect(() => {
        setChatConnection(friendUser, { isConnected: readyState === ReadyState.OPEN });
    }, [readyState, friendUser, setChatConnection]);

    // Handle incoming messages
    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const message: ChatMessage = JSON.parse(lastMessage.data);
                if (message.type === 'message') {
                    addMessage(friendUser, message);
                }
            } catch (error) {
                console.error('Error parsing chat message:', error);
            }
        }
    }, [lastMessage, friendUser, addMessage]);

    return null;
};

