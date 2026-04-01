import { useQuery } from '@tanstack/react-query';
import useAxios from '@/core/utils/useAxios'

interface RankListUser {
    username: string;
    rankpoints: number;
}

const fetchUsersRanks = async (): Promise<RankListUser[]> => {
  const axios = useAxios();
  const response = await axios.get<RankListUser[]>('ranks/');
  return response.data;
};

export const useGetUsersRanks = () => {
  return useQuery<RankListUser[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsersRanks,
  });
};