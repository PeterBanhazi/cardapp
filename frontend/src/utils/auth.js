import { useAuthStore } from '../store/auth';
import axios from './axios';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
///### todo set the token and the invalidator time in prod. 

export const login = async (username, password) => {
    try {
        const { data, status } = await axios.post('token/', {
            username,
            password,
        });
        if (status === 200) {
            setAuthUser(data.access, data.refresh);
        }
        return { data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || 'Something went wrong',
        };
    }
};

export const register = async (username, password, password2, email) => {
    try {
        const { data } = await axios.post('register/', {
            username,
            password,
            password2,
            email,
        });
        await login(username, password);
        return { data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response.data || 'Something went wrong',
        };
    }
};

export const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    useAuthStore.getState().setUser(null);

};

export const setUser = async () => {
    // ON PAGE LOAD

    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    if (!accessToken || !refreshToken) {
        return;
    }
    if (isAccessTokenExpired(accessToken)) {
        const response = await getRefreshToken(refreshToken);
        setAuthUser(response.access, response.refresh);
    } else {
        setAuthUser(accessToken, refreshToken);
    }
};

export const setAuthUser = (access_token, refresh_token) => {
    const expireTime = jwtDecode(access_token).exp;
    console.log(expireTime)
    Cookies.set('access_token', access_token, {
        expires: 1,
        secure: true,
    });

    Cookies.set('refresh_token', refresh_token, {
        expires: 7,
        secure: true,
    });

    const user = jwtDecode(access_token) ?? null;

    if (user) {
        useAuthStore.getState().setUser(user);
    }
    useAuthStore.getState().setLoading(false);
};

export const getRefreshToken = async () => {
    const refresh_token = Cookies.get('refresh_token');
    const response = await axios.post('token/refresh/', {
        refresh: refresh_token,
    });
    return response.data;
};

export const isAccessTokenExpired = (accessToken) => {
    try {
        const decodedToken = jwtDecode(accessToken);
        console.log(decodedToken.exp)
        console.log(Date.now() / 1000)
        console.log("time left: " + (decodedToken.exp-Date.now() / 1000)/60)
        return ((decodedToken.exp-Date.now() / 1000)/60)<1;
    } catch (err) {
        return true; // Token is invalid or expired
    }
};
