import { create } from 'zustand';
import axios from 'axios';
import { AuthState, LoginCredentials, RegisterCredentials } from '../utils/types';

const API_URL = 'http://localhost:8000/api/';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}token/`, 
        credentials,
        { withCredentials: true } // important for storing refresh token in httpOnly cookie
      );
      
      // Store access token in memory
      const { access } = response.data;
      
      // Get user info
      const userResponse = await axios.get(`${API_URL}users/me/`, {
        headers: {
          Authorization: `Bearer ${access}`
        }
      });
      
      set({ 
        accessToken: access,
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}register/`, credentials);
      
      // After successful registration, login the user
      await get().login({
        username: credentials.username,
        password: credentials.password
      });
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  },

  logout: () => {
    // Clear access token from memory
    set({ 
      user: null, 
      accessToken: null, 
      isAuthenticated: false 
    });
    
    // Optionally make call to backend to invalidate refresh token
    axios.post(
      `${API_URL}logout/`, 
      {}, 
      { withCredentials: true }
    ).catch(err => console.error('Error during logout:', err));
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      // Try to refresh the token using the httpOnly cookie
      const response = await axios.post(
        `${API_URL}token/refresh/`,
        {},
        { withCredentials: true }
      );
      
      const { access } = response.data;
      
      // Get user info
      const userResponse = await axios.get(`${API_URL}token/`, {
        headers: {
          Authorization: `Bearer ${access}`
        }
      });
      
      set({ 
        accessToken: access,
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      // If refresh fails, it's okay - user is just not logged in
      set({ 
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      return false;
    }
  }
}));