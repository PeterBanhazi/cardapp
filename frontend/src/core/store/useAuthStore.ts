import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
    API_BASE_URL,
    REFRESH_TOKEN_KEY,
    COOKIE_OPTIONS,
} from '../utils/constants';
import { useNotifications } from '@/shared/components/ui/notifications';


// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
    user_id: string | null;
    username: string | null;
}

interface DecodedToken {
    user_id: string;
    username?: string;
    exp: number;
    iat: number;
}

interface AuthState {
    user: UserData | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Actions
    initAuth: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    register: (
        username: string,
        password: string,
        password2: string,
        email: string,
    ) => Promise<void>;
    logout: () => Promise<void>;
    checkTokenExpiration: (token: string) => boolean;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

// Attach auth header on every request if we have a token.
// Doing it here rather than only at login time means it survives hot-reloads.
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Transparent token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest!._retry = true;

            const authStore = useAuthStore.getState();
            const refreshed = await authStore.refreshToken();

            if (refreshed) {
                // Access token has been updated in the store; re-attach it.
                originalRequest!.headers!['Authorization'] =
                    `Bearer ${authStore.accessToken}`;
                return api(originalRequest!);
            }
        }

        return Promise.reject(error);
    },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a human-readable message from an Axios error without leaking
 * internal API details to the UI layer.
 */
const parseApiError = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        // Never bubble raw server messages to the user — only use the fallback.
        // Log the real error server-side / in dev tooling instead.
        if (process.env.NODE_ENV === 'development') {
            console.error('[Auth] API error:', error.response?.data);
        }
        return fallback;
    }
    return error instanceof Error ? error.message : fallback;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: false,
            error: null,

            // ── clearError ──────────────────────────────────────────────────
            clearError: () => set({ error: null }),

            // ── checkTokenExpiration ────────────────────────────────────────
            checkTokenExpiration: (token) => {
                try {
                    const { exp } = jwtDecode<DecodedToken>(token);
                    return exp < Date.now() / 1000;
                } catch {
                    return true; // treat undecipherable tokens as expired
                }
            },

            // ── initAuth ────────────────────────────────────────────────────
            initAuth: async () => {
                set({ isLoading: true, isInitialized: false });

                try {
                    const authData = localStorage.getItem('auth-storage');
                    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

                    if (!authData || !refreshToken) {
                        set({ isLoading: false, isInitialized: true });
                        return;
                    }

                    const { state } = JSON.parse(authData) as {
                        state?: { user?: UserData };
                    };

                    if (!state?.user) {
                        set({ isLoading: false, isInitialized: true });
                        return;
                    }

                    const refreshed = await get().refreshToken();

                    if (refreshed) {
                        set({
                            user: state.user,
                            isAuthenticated: true,
                            isLoading: false,
                            isInitialized: true,
                        });
                    } else {
                        await get().logout();
                        set({ isInitialized: true });
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('[Auth] Init error:', error);
                    }
                    await get().logout();
                    set({ isLoading: false, isInitialized: true, error: null });
                }
            },

            // ── login ───────────────────────────────────────────────────────
            login: async (username, password) => {
                set({ isLoading: true, error: null });

                try {
                    const { data } = await api.post<{
                        access: string;
                        refresh: string;
                    }>('token/', { username, password });

                    const decoded = jwtDecode<DecodedToken>(data.access);
                    const user: UserData = {
                        user_id: decoded.user_id,
                        username: decoded.username ?? username,
                    };

                    Cookies.set(REFRESH_TOKEN_KEY, data.refresh, COOKIE_OPTIONS);

                    set({
                        user,
                        accessToken: data.access,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: parseApiError(error, 'Login failed. Please check your credentials.'),
                    });
                    // Re-throw so callers (e.g. register) can detect failure
                    throw error;
                }
            },

            // ── register ────────────────────────────────────────────────────
            // Sanitization of inputs is done in the component layer before
            // reaching here. We validate the one rule we can check client-side.
            register: async (username, password, password2, email) => {
                if (password !== password2) {
                    set({ error: 'Passwords do not match' });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    await api.post('register/', {
                        username,
                        password,
                        password2,
                        email,
                    });

                    // Auto-login after successful registration
                    await get().login(username, password);

                    // Fire success notification (same pattern as useUpdateProfile)
                    // Uncomment once you import useNotifications:
                    //
                    useNotifications.getState().addNotification({
                        type: 'success',
                        title: 'Welcome!',
                        message: `Account created successfully. Happy to see you ${username}!`,
                    });
                } catch (error) {
                    // login() above can also throw; consolidate the error here.
                    set({
                        isLoading: false,
                        error: parseApiError(
                            error,
                            'Registration failed. Username or email may already be in use.',
                        ),
                    });
                    // Re-throw so useMutation's onError handler fires in the component
                    throw error;
                }
            },

            // ── logout ──────────────────────────────────────────────────────
            logout: async () => {
                set({ isLoading: true, error: null });

                try {
                    const { accessToken } = get();
                    if (accessToken) {
                        // Best-effort server-side logout; ignore failures.
                        await api
                            .post('logout/', {})
                            .catch((err: unknown) => {
                                if (process.env.NODE_ENV === 'development') {
                                    console.warn('[Auth] Server logout failed:', err);
                                }
                            });
                    }
                } finally {
                    Cookies.remove(REFRESH_TOKEN_KEY);
                    localStorage.removeItem('auth-storage');

                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        error: null,
                        isLoading: false,
                    });

                }
            },

            // ── refreshToken ────────────────────────────────────────────────
            refreshToken: async () => {
                const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

                if (!refreshToken) {
                    await get().logout();
                    return false;
                }

                try {
                    // Use plain axios to avoid the interceptor triggering recursively
                    const { data } = await axios.post<{
                        access: string;
                        refresh?: string;
                    }>(`${api.defaults.baseURL}token/refresh/`, {
                        refresh: refreshToken,
                    });

                    if (data.refresh) {
                        Cookies.set(REFRESH_TOKEN_KEY, data.refresh, COOKIE_OPTIONS);
                    }

                    set({ accessToken: data.access });
                    return true;
                } catch {
                    await get().logout();
                    return false;
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Never persist the access token — it lives in memory only.
            // The refresh token lives in an HttpOnly cookie (set by the backend
            // ideally, or via js-cookie as a fallback).
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
