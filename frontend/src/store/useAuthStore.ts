import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL, REFRESH_TOKEN_KEY, COOKIE_OPTIONS } from '../utils/constants';

import { useNavigate } from 'react-router-dom';

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
  isInitialized: boolean; // track initialization status
  
  // Actions
  initAuth: () => Promise<void>; // Initialization function to set user on page loads
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, password2: string, email: string)  => Promise<void>;
  logout: () => void;
  checkTokenExpiration: (token: string) => boolean; // Utility function to check token expiration
  refreshToken: () => Promise<boolean>;
  clearError:  () => void

}

const api = axios.create({
  baseURL: API_BASE_URL,
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
      isInitialized: false, // Track if the auth store has been initialized
      error: null,
      
      clearError: () => set({ error: null }),
       // Check if token is expired
       checkTokenExpiration: (token: string) => {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          // Return true if token is expired
          return decoded.exp < currentTime;
        } catch (error) {
          // If token can't be decoded, consider it expired
          return true;
        }
      },
      
      // Initialize authentication state on app load
      initAuth: async () => {
        set({ isLoading: true, isInitialized: false });
        
        try {
          // Check localStorage for user data
          const authData = localStorage.getItem('auth-storage');
          const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
          
          if (!authData || !refreshToken) {
            // No stored auth data or refresh token
            set({ isLoading: false, isInitialized: true });
            return;
          }
          
          // Parse stored auth data
          const { state } = JSON.parse(authData);
          
          if (!state || !state.user) {
            set({ isLoading: false, isInitialized: true });
            return;
          }
          
          // Try to get a new access token using the refresh token
          const refreshed = await get().refreshToken();
          
          if (refreshed) {
            // Auth restored successfully
            set({ 
              user: state.user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true
            });
          } else {
            // Refresh failed, clear the auth state
            get().logout();
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().logout();
          set({ 
            isLoading: false, 
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Authentication initialization failed'
          });
        }
      },

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
          const navigate = useNavigate();             
          navigate('/lobby');
        } catch (error) {
          
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
          

        
        }
      },

      register: async (username, password, password2, email) => {
        // Validate passwords match (also validated at forms....)
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
          // const refreshToken = response.data.refresh;
          // // Store refresh token in cookie
          // Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
          // Log in user to app 
          await get().login(username, password);
          
        } catch (error) {
    
    
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Optional: Call logout API endpoint if you have one
          const accessToken = get().accessToken;
          if (accessToken) {
            try {
              await api.post('logout/', {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              
            } catch (error) {
              // Continue with logout even if server-side logout fails
              console.error('Server logout failed:', error);
            }
          }
        } finally {
     
          // Remove the refresh token cookie
          Cookies.remove(REFRESH_TOKEN_KEY);
          
          // Clear localStorage items if needed
          localStorage.removeItem('auth-storage');
          
          // Clear the auth state
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
            isLoading: false, 
          });
    
          // Remove Authorization header
          delete api.defaults.headers.common['Authorization'];
        }
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
            `${api.defaults.baseURL}token/refresh/`,
            {  refresh: refreshToken }
          );
          
          const newRefreshToken  = response.data.refresh;
          const accessToken = response.data.access;
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
      storage: createJSONStorage(() => localStorage),
      // Only persist certain parts of the state (not the access token)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
export { api };