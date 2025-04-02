import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import  useAxios  from './useAxios';

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
