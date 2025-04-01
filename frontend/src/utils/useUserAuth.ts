import { useAuthStore } from "../store/auth";
import { useEffect } from "react";
import axios from "./axios";

const useAxios = () => {
    const { 
      accessToken, 
      user, 
      isAuthenticated,
      isLoading,
      login, 
      logout, 
      refreshToken, 
      getUser, 
      setUser 
    } = useAuthStore();
  
    // Setup axios interceptor for automatic token refresh
    useEffect(() => {
      // Create axios response interceptor
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          // If the error is 401 and we haven't already tried to refresh
          if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Attempt to refresh the token
              await refreshToken();
              
              // Update the authorization header with new token
              originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
              
              // Retry the original request
              return axios(originalRequest);
            } catch (refreshError) {
              // If refresh failed, redirect to login or handle as needed
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
      
      // Clean up the interceptor when component unmounts
      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    }, [refreshToken]);
  
    return {
      accessToken,
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      getUser,
      setUser
    };
};
  
export default useAxios