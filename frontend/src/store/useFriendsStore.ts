import React, { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'


import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';

// Types
interface Friend {
  user: string;
  status: 'online' | 'offline' | 'request' | 'closed' | 'accepted';
}

interface StatusMessage {
    type: 'system_message';
    user: string;
    sender: string;
    event: string;
    status: 'online' | 'offline' | 'request' | 'closed' | 'accepted';
}



interface FriendsState {
    friends: Record<string, Friend>;
    isConnected: boolean;
    sendMessage: ((message: string) => void) | null;
    setFriendStatus: (user: string, status: Friend['status']) => void;
    setConnected: (connected: boolean) => void;
    setSendMessage: (sendFn: ((message: string) => void) | null) => void;
    sendChatRequest: (user: string) => void;
    acceptChatRequest: (user: string) => void;
    resetFriends: () => void;
}


// Zustand Store
export const useFriendsStore = create<FriendsState>()(devtools(((set, get) => ({
  friends: {},
  isConnected: false,
  sendMessage: null,
  setFriendStatus: (user: Friend['user'], status: Friend['status']) => {
    set((state) => ({
      friends: {
        ...state.friends,
        [user]: { user, status },
      },
    }),undefined,
      'setFriendStatus',);
    
    // Auto-open chat when request is accepted
    if (status === 'accepted') {
      const chatStore = useChatStore.getState();
      chatStore.openChat(user);
    }
  },
  setConnected: (connected: boolean) =>
    set({ isConnected: connected }),
  setSendMessage: (sendFn: ((message: string) => void) | null) =>
    set({ sendMessage: sendFn }),
  sendChatRequest: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user: user,
        sender: useAuthStore.getState().user?.username,
        event: "chat_request",
        status: "request"
      });
      sendMessage(message);
      console.log('Sent chat request:', message);
    } else {
      console.warn('Cannot send message: WebSocket not connected or sendMessage not available');
    }
  },
  acceptChatRequest: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user: user,
        sender: useAuthStore.getState().user?.username,
        event: "chat_request",
        status: "accepted"
      });
      sendMessage(message);
      console.log('Accepted chat request:', message);
    }
  },
  resetFriends: () => set({ friends: {}, isConnected: false, sendMessage: null }),
}))));


export const WebSocketStatusManager = (url: string, options: any = {}) => {
  const { setFriendStatus, setConnected, setSendMessage, resetFriends } = useFriendsStore();
  
  const { lastMessage, readyState, sendMessage } = useWebSocket(
    url, // Replace with your actual WebSocket URL
    {
      onOpen: () => {
        console.log('WebSocket connection opened');
        setConnected(true);
      },
      onClose: () => {
        console.log('WebSocket connection closed');
        setConnected(false);
        resetFriends();
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      },
       ...options,
    }
  );

  // Set the sendMessage function in the store when WebSocket is ready
  useEffect(() => {
    if (readyState === ReadyState.OPEN && sendMessage) {
      setSendMessage(sendMessage);
    } else {
      setSendMessage(null);
    }
  }, [readyState, sendMessage, setSendMessage]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const message: StatusMessage = JSON.parse(lastMessage.data);
        //   if (message.user === useAuthStore.getState().user?.username) {
        //      setFriendStatus(message.user, message.status);
        //  }
          
          if (message.type === 'system_message') {
           
          setFriendStatus(message.sender, message.status);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, setFriendStatus]);

  useEffect(() => {
    setConnected(readyState === ReadyState.OPEN);
  }, [readyState, setConnected]);

  return null; // This is a logic-only component
};

