import { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import { WS_BASE_URL } from '../../utils/constants';
import { useAuthStore } from '../../store/useAuthStore';

interface ChatMessage {
  type: 'message';
  message: string;
  sender: string;
  timestamp?: string;
}

const useWebSocketChat = (friendUsername: string | null) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
    // Only create a WebSocket connection if there's an active friend
    const accessToken = useAuthStore().accessToken;
  const wsUrl = friendUsername ? `${WS_BASE_URL}ws/chat/${friendUsername}/?token=${accessToken}` : null;
  
  const {
    sendMessage: wsSendMessage,
    lastMessage,
    readyState
  } = useWebSocket(wsUrl, {
    onOpen: () => {
      console.log(`Chat connection opened with ${friendUsername}`);
      setConnected(true);
      // Reset messages when connecting to a new friend
      setMessages([]);
    },
    onClose: () => {
      console.log(`Chat connection closed with ${friendUsername}`);
      setConnected(false);
    },
    onError: (error) => {
      console.error(`Chat connection error with ${friendUsername}:`, error);
      setConnected(false);
    },
    // Only attempt to connect when there's a friend selected
    shouldReconnect: () => friendUsername !== null,
  });
  
  // Parse incoming messages
  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        // Handle message objects from the server
        if (data.type === 'message') {
          setMessages(prev => [...prev, data as ChatMessage]);
        }
        
        // Handle initial message history from server
        if (Array.isArray(data)) {
          const chatMessages = data
            .filter(msg => msg.type === 'message')
            .map(msg => msg as ChatMessage);
            
          setMessages(chatMessages);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    }
  }, [lastMessage]);
  
  // Function to send chat messages
  const sendMessage = useCallback((message: Omit<ChatMessage, 'timestamp'>) => {
    if (connected && wsUrl) {
      try {
        wsSendMessage(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [connected, wsUrl, wsSendMessage]);
  
  // Clear messages when friend changes
  useEffect(() => {
    setMessages([]);
  }, [friendUsername]);
  
  return {
    connected,
    messages,
    sendMessage,
    readyState
  };
};

export default useWebSocketChat;