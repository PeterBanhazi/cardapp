import React, { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'


import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';

import {Friend} from "@/shared/types/friend"

interface StatusMessage {
    type: 'system_message';
    user_to: string;
    user_from: string;
    event: string;
    action?: string;
    status: Friend["status"]
}



interface FriendsState {
    friends: Record<string, Friend>;
    isConnected: boolean;
    sendMessage: ((message: string) => void) | null;
    setFriendStatus: (user: string, status: Friend['status']) => void;
    setConnected: (connected: boolean) => void;
    setSendMessage: (sendFn: ((message: string) => void) | null) => void;
    sendChatRequest: (user: string) => void;
    sendClosedChat:(user: string) => void;
    sendAcceptChatRequest: (user: string) => void;
    sendRejectChatRequest: (user: string) => void;
    sendCancelledChat: (user: string) => void;
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
    // if (status === 'pending') {
    //   const chatStore = useChatStore.getState();
    //   chatStore.openChat(user);
    // }
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
        user_to: user,
        user_from: useAuthStore.getState().user?.username,
        action: "chat_request",
       
      });
      sendMessage(message);
      console.log('Sent chat request:', message);
    } else {
      console.warn('Cannot send message: WebSocket not connected or sendMessage not available');
    }
  },
  sendAcceptChatRequest: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user_to: user,
        user_from: useAuthStore.getState().user?.username,
        action: "accept_chat",        
      });
      sendMessage(message);
      console.log('Accepted chat request:', message);
    }
  },
  sendRejectChatRequest: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user_to: user,
        user_from: useAuthStore.getState().user?.username,
        action: "reject_chat",        
      });
      sendMessage(message);
      console.log('Rejected chat:', message);
    }
  },
  sendCancelledChat: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user_to: user,
        user_from: useAuthStore.getState().user?.username,
        action: "cancel_chat",        
      });
      sendMessage(message);
      console.log('Cancelled chat request chat:', message);
    }
  },
  sendClosedChat: (user: string) => {
    const { sendMessage, isConnected } = get();
    if (sendMessage && isConnected) {
      const message = JSON.stringify({
        type: "system_message",
        user_to: user,
        user_from: useAuthStore.getState().user?.username,
        action: "close_chat",        
      });
      sendMessage(message);
      console.log('Closed chat:', message);
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
          
        if (['system log_out event', 'system log_in event'].includes(message.event)) {
           
          setFriendStatus(message.user_from, message.status);
        }
        if (['chat_request_received', 'chat_request_sent'].includes(message.event)) {
            
           
          setFriendStatus(message.user_to, message.status);
        }
        if (message.event === 'chat_request_received') {
          setFriendStatus(message.user_from, message.status);
        }

        if (message.event === 'chat_request_accepted') {
           
          setFriendStatus(message.user_from, message.status);
          setFriendStatus(message.user_to, message.status);
        }
        
        if (message.event === 'chat_request_rejected') {
           
          setFriendStatus(message.user_from, message.status);
          setFriendStatus(message.user_to, message.status);
        }
        if (message.event === 'cancel_chat') {
           
          setFriendStatus(message.user_from, message.status);
          setFriendStatus(message.user_to, message.status);
        }
        if (message.event === 'chat_closed') {
           
          setFriendStatus(message.user_from, message.status);
          setFriendStatus(message.user_to, message.status);
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

