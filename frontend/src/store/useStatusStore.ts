import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import  useWebSocket  from 'react-use-websocket';
import { API_BASE_URL } from '../utils/constants';

interface FriendStatus {
  username: string;
  isOnline: boolean;
  lastActivity?: string;
}

interface StatusState {
  friendsStatus: Record<string, FriendStatus>;
  statusSocketUrl: string | null;
  isConnected: boolean;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  updateFriendStatus: (username: string, isOnline: boolean) => void;
  initializeFriendsStatus: (statuses: FriendStatus[]) => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  friendsStatus: {},
  statusSocketUrl: null,
  isConnected: false,
  
  connect: () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    
    const socketUrl = `ws://localhost:9000/ws/status/?token=${accessToken}`;
    set({ statusSocketUrl: socketUrl });
  },
  
  disconnect: () => {
    set({ statusSocketUrl: null, isConnected: false });
  },
  
  updateFriendStatus: (username, isOnline) => {
    set((state) => ({
      friendsStatus: {
        ...state.friendsStatus,
        [username]: {
          ...state.friendsStatus[username],
          username,
          isOnline,
          lastActivity: new Date().toISOString()
        }
      }
    }));
  },
  
  initializeFriendsStatus: (statuses) => {
    const statusMap: Record<string, FriendStatus> = {};
    statuses.forEach(status => {
      statusMap[status.username] = {
        username: status.username,
        isOnline: status.isOnline,
        lastActivity: status.lastActivity
      };
    });
    
    set({ friendsStatus: statusMap });
  }
}));

// WebSocket hook that needs to be used in a component
export const useStatusWebSocket = () => {
  const { statusSocketUrl, updateFriendStatus, initializeFriendsStatus } = useStatusStore();
  const { lastJsonMessage } = useWebSocket(statusSocketUrl || null, {
    onOpen: () => {
      useStatusStore.setState({ isConnected: true });
    },
    onClose: () => {
      useStatusStore.setState({ isConnected: false });
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000
  });
  
  // Handle incoming WebSocket messages
  if (lastJsonMessage) {
    const data = lastJsonMessage as any;
    
    if (data.type === 'status') {
      updateFriendStatus(
        data.user,
        data.status === 'online'
      );
    }
  }
  
  return { connected: useStatusStore((state) => state.isConnected) };
};