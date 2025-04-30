import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Define types for user data
interface UserData {
  user_id: string |null;
  username: string |null;
}
interface DecodedToken {
  user_id: string;
  username?: string; // optional if you include it in the token
  exp: number;
  iat: number;
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, password: string, password2: string, email: string)  => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const REFRESH_TOKEN_KEY = 'refresh_token';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 5000, // timeout after 5 seconds
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try refreshing the token
      const authStore = useAuthStore.getState();
      const refreshed = await authStore.refreshToken();
      
      if (refreshed) {
        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('token/', {
            username,
            password,
        });
        
          const accessToken = response.data.access;
          const refreshToken = response.data.refresh;
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const user: UserData = {
            user_id: decoded.user_id,
            username: decoded.username || username, // fallback if not in token
          };
    
          set({ accessToken: accessToken, user });
          console.log("hey"+user)
          
          // Store refresh token in cookie
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
          
          // Store user and access token in memory
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set the default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
        }
      },

      register: async (username, password, password2, email) => {
        // Validate passwords match
        if (password !==  password2) {
          set({ error: 'Passwords do not match' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Send registration request
          const response = await api.post('register/', {
            username,
            password,
            password2,
            email,
        });
          
          // If the API returns tokens directly after registration (auto-login)
          ///#!!!!!
          const { user } = response.data;
          const accessToken = response.data.access;
          const refreshToken = response.data.refresh;
          // Store refresh token in cookie
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
          
          // Store user and access token in memory
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set the default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          });
        }
      },

      logout: () => {
        // Remove the refresh token cookie
        Cookies.remove(REFRESH_TOKEN_KEY);
        
        // Clear the auth state
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null
        });
        
        // Remove Authorization header
        delete api.defaults.headers.common['Authorization'];
      },
      
      refreshToken: async () => {
        // Get refresh token from cookie
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          get().logout();
          return false;
        }
        
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/token/refresh`,
            { refreshToken }
          );
          
          const { accessToken, newRefreshToken } = response.data;
          
          // Update refresh token in cookie if we got a new one
          if (newRefreshToken) {
            Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, COOKIE_OPTIONS);
          }
          
          // Update access token in memory
          set({ accessToken });
          
          // Update the default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          return true;
        } catch (error) {
          // If refresh fails, log the user out
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist certain parts of the state (not the access token)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
export { api };