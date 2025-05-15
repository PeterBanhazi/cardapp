import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { api } from './useAuthStore';
import useWebSocket from 'react-use-websocket';
import { API_BASE_URL } from '../utils/constants';

interface ChatMessage {
  id?: number;
  sender: string;
  receiver?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  activeChat: string | null;
  chatSocketUrl: string | null;
  isTyping: Record<string, boolean>;
  unreadCounts: Record<string, number>;
  
  // Actions
  setActiveChat: (username: string | null) => void;
  sendMessage: (content: string) => void;
  receiveMessage: (message: ChatMessage) => void;
  loadChatHistory: (username: string) => Promise<void>;
  markMessagesAsRead: (username: string) => Promise<void>;
  updateTypingStatus: (username: string, isTyping: boolean) => void;
  connectToChat: (username: string) => void;
  disconnectFromChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  activeChat: null,
  chatSocketUrl: null,
  isTyping: {},
  unreadCounts: {},
  
  setActiveChat: (username) => {
    set({ activeChat: username });
    
    if (username) {
      // Connect to the chat WebSocket for this user
      get().connectToChat(username);
      
      // Load chat history if not already loaded
      if (!get().messages[username]) {
        get().loadChatHistory(username);
      }
      
      // Mark messages as read
      get().markMessagesAsRead(username);
    } else {
      get().disconnectFromChat();
    }
  },
  
  sendMessage: (content) => {
    const activeChat = get().activeChat;
    if (!activeChat || !content.trim()) return;
    
    const currentUser = useAuthStore.getState().user?.username;
    if (!currentUser) return;
    
    // Create a new message object
    const newMessage: ChatMessage = {
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Add message to local state
    set((state) => ({
      messages: {
        ...state.messages,
        [activeChat]: [
          ...(state.messages[activeChat] || []),
          newMessage
        ]
      }
    }));
    
    // The WebSocket component will handle the actual sending of the message
  },
  
  receiveMessage: (message) => {
    const otherUser = message.sender === useAuthStore.getState().user?.username
      ? message.receiver
      : message.sender;
      
    if (!otherUser) return;
    
    // Add message to chat history
    set((state) => {
      const isActive = state.activeChat === otherUser;
      const currentMessages = state.messages[otherUser] || [];
      const unreadCount = isActive ? 0 : (state.unreadCounts[otherUser] || 0) + 1;
      
      return {
        messages: {
          ...state.messages,
          [otherUser]: [...currentMessages, message]
        },
        unreadCounts: {
          ...state.unreadCounts,
          [otherUser]: unreadCount
        }
      };
    });
    
    // Mark as read if this is the active chat
    if (get().activeChat === otherUser) {
      get().markMessagesAsRead(otherUser);
    }
  },
  
  loadChatHistory: async (username) => {
    try {
      const response = await api.get(`chat/messages/?friend=${username}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [username]: response.data
        }
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },
  
  markMessagesAsRead: async (username) => {
    try {
      // First find the friend's user ID
      const friendId = await api.get(`users/id/${username}/`).then(res => res.data.id);
      await api.get(`chat/messages/read/${friendId}/`);
      
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [username]: 0
        }
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },
  
  updateTypingStatus: (username, isTyping) => {
    set((state) => ({
      isTyping: {
        ...state.isTyping,
        [username]: isTyping
      }
    }));
  },
  
  connectToChat: (username) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    
    const socketUrl = `ws://localhost:9000/ws/status/?token=${accessToken}`;
    set({ chatSocketUrl: socketUrl });
  },
  
  disconnectFromChat: () => {
    set({ chatSocketUrl: null });
  }
}));

// WebSocket hook that needs to be used in a component
export const useChatWebSocket = () => {
  const { chatSocketUrl, receiveMessage, updateTypingStatus } = useChatStore();
  const currentUser = useAuthStore((state) => state.user?.username);
  const activeChat = useChatStore((state) => state.activeChat);
  
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(chatSocketUrl || null, {
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: 3000
  });
  
  // Handle incoming WebSocket messages
  if (lastJsonMessage) {
    const data = lastJsonMessage as any;
    
    if (data.type === 'message') {
      receiveMessage({
        sender: data.sender,
        content: data.message,
        timestamp: data.timestamp,
        isRead: data.sender === currentUser
      });
    } else if (data.type === 'typing') {
      if (data.user !== currentUser) {
        updateTypingStatus(data.user, data.is_typing);
      }
    }
  }
  
  // Function to send message via WebSocket
  const sendMessage = (content: string) => {
    if (!activeChat || !content.trim()) return;
    
    sendJsonMessage({
      type: 'message',
      message: content
    });
    
    // Also update local state via the store function
    useChatStore.getState().sendMessage(content);
  };
  
  // Function to update typing status
  const sendTypingStatus = (isTyping: boolean) => {
    sendJsonMessage({
      type: 'typing',
      is_typing: isTyping
    });
  };
  
  return { sendMessage, sendTypingStatus };
};