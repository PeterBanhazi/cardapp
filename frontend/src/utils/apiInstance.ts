import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
//worthless to struggle with ....


// Axios instance with base configuration
const apiInstance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 5000, // Timeout after 5 seconds
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Helper methods for API operations
const api = {
    // GET method
    get: async <T>(url: string, config?: InternalAxiosRequestConfig): Promise<InternalAxiosResponse<T>> => {
        return await apiInstance.get<T>(url, config);
    },

    // POST method
    post: async <T>(
        url: string,
        data?: any,
        config?: InternalAxiosRequestConfig
    ): Promise<InternalAxiosResponse<T>> => {
        return await apiInstance.post<T>(url, data, config);
    },

    // PUT method
    put: async <T>(
        url: string,
        data?: any,
        config?: InternalAxiosRequestConfig
    ): Promise<InternalAxiosResponse<T>> => {
        return await apiInstance.put<T>(url, data, config);
    },

    // DELETE method
    delete: async <T>(url: string, config?: InternalAxiosRequestConfig): Promise<InternalAxiosResponse<T>> => {
        return await apiInstance.delete<T>(url, config);
    },
};

export default api;