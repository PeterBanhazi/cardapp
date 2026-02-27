import { create } from 'zustand';


// Define the message type - extend this based on your application needs
import { WSMessage } from '../utils/types';
// Define the WebSocket store state
interface WebSocketState {
  // Connection status
  isConnected: boolean;
  // Message history
  messages: WSMessage[];
  // Last received message
  lastMessage: WSMessage | null;
  // Connection error if any
  error: Error | null;
  // Current connection URL (if any)
  url: string | null;
  // Functions to interact with the WebSocket
  sendMessage: (message: WSMessage | string) => void;
  clearMessages: () => void;
}

// Create the Zustand store
export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  messages: [],
  lastMessage: null,
  error: null,
  url: null,
  sendMessage: (message: WSMessage | string) => {
    console.warn('WebSocket not initialized yet');
  },
  clearMessages: () => {
    set({ messages: [], lastMessage: null });
  }
}));

