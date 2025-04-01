import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // needed for cookies
});

// Custom hook for using axios with authentication
export const useAxios = () => {
  const { accessToken, logout, initializeAuth } = useAuthStore();
  
  // Set up request interceptor to add the token to requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Set up response interceptor to handle token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // If the error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          await initializeAuth();
          
          // If refresh successful, retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default axiosInstance;