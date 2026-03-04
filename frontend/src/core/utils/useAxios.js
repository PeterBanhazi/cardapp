import { api } from "../store/useAuthStore"

const useAxios = () => {
    const apiInstance = api;
    return apiInstance
};

export default useAxios;
