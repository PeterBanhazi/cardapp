import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import  useAxios  from './useAxios';
import { useNotifications } from '../components/ui/notifications';

// Hook for GET requests with React Query
export function useApiQuery<T>(
  queryKey: string[], 
  url: string, 
  options?: UseQueryOptions<T, AxiosError>
) {
  const axios = useAxios();
  
  return useQuery<T, AxiosError>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<T>(url);
      return response.data;
    },
    ...options
  });
}
interface ProfileData {
  first_name: string;
  last_name: string;
  description: string;
  avatar_image?: string;
  birthday: string | null;
}

export type ApiError = {
  message: string;
  statusCode: number;
};

// Parse error from Axios
const parseError = (error: AxiosError): ApiError => {
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: error.response?.status || 500,
  };
};

export const useProfile = (enabled = true) => {
  return useQuery<ProfileData, ApiError>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data } = await useAxios().get('/profile');
        return data;
      } catch (error) {
        throw parseError(error as AxiosError);
      }
    },
    enabled,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ProfileData, ApiError, ProfileData>({
    mutationFn: async (updatedProfile) => {
      try {
        const { data } = await useAxios().put(`/profile/`, updatedProfile);
        return data;
      } catch (error) {
        throw parseError(error as AxiosError);
      }
    },
    onSuccess: (data) => {
      // Update specific product cache and products list
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      useNotifications.getState().addNotification({
        type: 'success',
        title: 'Congratulatios!',
        message: "Your profile has been updated successfully!",
      });
    },
  });
};


// Hook for POST requests with React Query
export function useApiMutation<T, D>(
  url: string,
  options?: UseMutationOptions<AxiosResponse<T>, AxiosError, D>
) {
  const axios = useAxios();
  
  return useMutation<AxiosResponse<T>, AxiosError, D>({
    mutationFn: (data: D) => axios.post<T>(url, data),
    ...options
  });
}

// Hook for PUT requests with React Query
export function useApiPut<T, D>(
  url: string,
  options?: UseMutationOptions<AxiosResponse<T>, AxiosError, D>
) {
  const axios = useAxios();
  
  return useMutation<AxiosResponse<T>, AxiosError, D>({
    mutationFn: (data: D) => axios.put<T>(url, data),
    ...options
  });
}

// Hook for PATCH requests with React Query
export function useApiPatch<T, D>(
  url: string,
  options?: UseMutationOptions<AxiosResponse<T>, AxiosError, D>
) {
  const axios = useAxios();
  
  return useMutation<AxiosResponse<T>, AxiosError, D>({
    mutationFn: (data: D) => axios.patch<T>(url, data),
    ...options
  });
}
