import { createWithEqualityFn as create } from 'zustand/traditional'
import { mountStoreDevtool } from 'simple-zustand-devtools';

// Define types for user data
interface UserData {
  user_id: string |null;
  username: string |null;
}

interface AuthState {
  allUserData: UserData | null; // User data or null when not logged in
  loading: boolean;
  user: () => Partial<UserData>;
  setUser: (user: UserData) => void;
  setLoading: (loading: boolean) => void;
  isLoggedIn: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  allUserData: null,
  loading: false,
  user: () => ({
    user_id: get().allUserData?.user_id || null,
    username: get().allUserData?.username || null,
  }),
  setUser: (user) => set({ allUserData: user }),
  setLoading: (loading) => set({ loading }),
  isLoggedIn: () => get().allUserData !== null,
}));

if (import.meta.env.DEV) {
  mountStoreDevtool('Store', useAuthStore);
}

export { useAuthStore };
