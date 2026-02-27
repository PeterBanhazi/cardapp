import { useCallback, useEffect, useRef } from 'react';
import  useWebSocket from 'react-use-websocket';
import { useWebSocketStore } from './useWebsocketStore';
import { WSMessage } from '../utils/types';

// Hook for components to access WebSocket state without creating a connection
export const useWebSocketState = () => {
  const { isConnected, messages, lastMessage, error, sendMessage, clearMessages } = useWebSocketStore();
  
  return {
    isConnected,
    messages,
    lastMessage,
    error,
    sendMessage,
    clearMessages
  };
};

// Internal hook used by the provider to establish the WebSocket connection
export const useWebSocketConnection = (url: string, options: any = {}) => {
  const sendMessageRef = useRef<(message: WSMessage | string) => void>();
  
  const { lastMessage: wsLastMessage, sendMessage: wsSendMessage } = useWebSocket(url, {
    onOpen: () => {
      console.log('WebSocket connection established');
      useWebSocketStore.setState({ isConnected: true, url });
    },
    onClose: () => {
      console.log('WebSocket connection closed');
      useWebSocketStore.setState({ isConnected: false });
    },
    onError: (event: any) => {
      console.error('WebSocket error:', event);
      useWebSocketStore.setState({ error: new Error('WebSocket connection error') });
    },
    ...options,
  });

  // Create the sendMessage function
  const sendMessageHandler = useCallback((message: WSMessage | string) => {
    try {
      const messageString = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
      wsSendMessage(messageString);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [wsSendMessage]);

  // Store the sendMessage function in a ref
  sendMessageRef.current = sendMessageHandler;

  // Update the store with the sendMessage function
  useEffect(() => {
    useWebSocketStore.setState({ sendMessage: sendMessageHandler });
  }, [sendMessageHandler]);

  // Process incoming messages
  useEffect(() => {
    if (wsLastMessage?.data) {
      try {
        const parsedMessage: WSMessage = JSON.parse(wsLastMessage.data);
        if (parsedMessage.status === 'request') {
          console.log(parsedMessage)
        }
        useWebSocketStore.setState(state => ({
          messages: [...state.messages, parsedMessage],
          lastMessage: parsedMessage
        }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        
        // Handle non-JSON messages
        const textMessage: WSMessage = {
          type: 'text',
          user: 'JSONerror',
          status: 'JSONerror',
          payload: wsLastMessage.data,
        };
        
        useWebSocketStore.setState(state => ({
          messages: [...state.messages, textMessage],
          lastMessage: textMessage
        }));
      }
    }
  }, [wsLastMessage]);
};

// Additional custom hooks for specific WebSocket operations
export const useWebSocketSender = () => {
  const { sendMessage, isConnected } = useWebSocketStore();
  
  const sendJsonMessage = useCallback((type: string, user:string, status:string,  payload?: any) => {
    if (!isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
    
    sendMessage({ type,user,status,payload });
    return true;
  }, [sendMessage, isConnected]);
  
  return { sendJsonMessage, isConnected };
};

export const useWebSocketMessages = <T extends WSMessage = WSMessage>(
  messageType?: string
) => {
  const { messages } = useWebSocketStore();
  
  // Filter messages by type if specified
  const filteredMessages = messageType 
    ? messages.filter(msg => msg.type === messageType) as T[]
    : messages as T[];
    
  return filteredMessages;
};

export const useLastMessage = <T extends WSMessage = WSMessage>(
  messageType?: string
) => {
  const { lastMessage } = useWebSocketStore();
  
  if (!lastMessage) return null;
  if (messageType && lastMessage.type !== messageType) return null;
  
  return lastMessage as T;
};