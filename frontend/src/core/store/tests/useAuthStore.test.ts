/**
 * src/core/store/useAuthStore.test.ts
 *
 * Unit tests for useAuthStore.
 * MSW lifecycle is handled globally in src/test/setup.ts.
 * Default handlers live in src/test/mswServer.ts.
 * Per-test overrides use server.use(...) inside beforeEach blocks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import Cookies from 'js-cookie';
import { useAuthStore } from '../useAuthStore';
import { BASE, server, validAccessToken } from '@/test/mswServer';
import { expiredAccessToken } from '@/test/jwtHelper';




// ─── Reset store + storage between every test ─────────────────────────────────

beforeEach(() => {
    useAuthStore.setState({
        user:            null,
        accessToken:     null,
        isAuthenticated: false,
        isLoading:       false,
        isInitialized:   false,
        error:           null,
    });
    localStorage.clear();
    Object.keys(Cookies.get()).forEach((key) => Cookies.remove(key));
});

// ─── clearError ──────────────────────────────────────────────────────────────

describe('clearError', () => {
    it('sets error to null', () => {
        useAuthStore.setState({ error: 'Something went wrong' });
        useAuthStore.getState().clearError();
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('does not throw when error is already null', () => {
        useAuthStore.setState({ error: null });
        expect(() => useAuthStore.getState().clearError()).not.toThrow();
        expect(useAuthStore.getState().error).toBeNull();
    });
});

// ─── checkTokenExpiration ────────────────────────────────────────────────────

describe('checkTokenExpiration', () => {
    const { checkTokenExpiration } = useAuthStore.getState();

    it('returns true for an expired token', () => {
        expect(checkTokenExpiration(expiredAccessToken)).toBe(true);
    });

    it('returns false for a valid token', () => {
        expect(checkTokenExpiration(validAccessToken)).toBe(false);
    });

    it('returns true for a completely invalid string', () => {
        expect(checkTokenExpiration('this.is.notajwt')).toBe(true);
    });

    it('returns true for an empty string', () => {
        expect(checkTokenExpiration('')).toBe(true);
    });
});

// ─── register — password mismatch ────────────────────────────────────────────

describe('register — password mismatch', () => {
    it('sets an error when passwords do not match', async () => {
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Different1!', 'john@example.com',
        );
        expect(useAuthStore.getState().error).toBe('Passwords do not match');
    });

    it('does not call the API when passwords do not match', async () => {
        const apiSpy = vi.fn();
        server.use(
            http.post(`${BASE}register/`, () => {
                apiSpy();
                return HttpResponse.json({});
            }),
        );
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Different1!', 'john@example.com',
        );
        expect(apiSpy).not.toHaveBeenCalled();
    });

    it('leaves isLoading as false on mismatch', async () => {
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Different1!', 'john@example.com',
        );
        expect(useAuthStore.getState().isLoading).toBe(false);
    });
});

// ─── login — success ─────────────────────────────────────────────────────────

describe('login — success', () => {
    it('sets isAuthenticated to true', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('populates user data from the JWT payload', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        const { user } = useAuthStore.getState();
        expect(user?.user_id).toBe('42');
        expect(user?.username).toBe('testjohn');
    });

    it('stores the access token in the store', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().accessToken).toBe(validAccessToken);
    });

    it('saves the refresh token to a cookie', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(Cookies.get('refresh_token')).toBe('mock-refresh-token');
    });

    it('sets isLoading to false after a successful login', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('clears any previous error', async () => {
        useAuthStore.setState({ error: 'Previous error' });
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().error).toBeNull();
    });
});

// ─── login — failure ─────────────────────────────────────────────────────────

describe('login — failure (401)', () => {
    beforeEach(() => {
        server.use(
            http.post(`${BASE}token/`, () =>
                HttpResponse.json(
                    { detail: 'No active account found with the given credentials' },
                    { status: 401 },
                ),
            ),
        );
    });

    it('sets a generic error message (raw server response is not exposed)', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong_password'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().error).toBe(
            'Login failed. Please check your credentials.',
        );
    });

    it('leaves isAuthenticated as false', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong_password'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('sets isLoading to false after failure', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong_password'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('leaves accessToken as null', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong_password'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().accessToken).toBeNull();
    });
});

// ─── register — success ───────────────────────────────────────────────────────

describe('register — success', () => {
    it('automatically logs in after successful registration', async () => {
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Password1!', 'john@example.com',
        );
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('sets isLoading to false after successful registration', async () => {
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Password1!', 'john@example.com',
        );
        expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('populates user data in the store', async () => {
        await useAuthStore.getState().register(
            'john', 'Password1!', 'Password1!', 'john@example.com',
        );
        expect(useAuthStore.getState().user?.username).toBe('testjohn');
    });
});

// ─── register — API error ─────────────────────────────────────────────────────

describe('register — API error (400)', () => {
    beforeEach(() => {
        server.use(
            http.post(`${BASE}register/`, () =>
                HttpResponse.json(
                    { username: ['A user with that username already exists.'] },
                    { status: 400 },
                ),
            ),
        );
    });

    it('sets a generic error message (raw server response is not exposed)', async () => {
        await expect(
            useAuthStore.getState().register(
                'taken', 'Password1!', 'Password1!', 'john@example.com',
            ),
        ).rejects.toThrow();
        expect(useAuthStore.getState().error).toBe(
            'Registration failed. Username or email may already be in use.',
        );
    });

    it('leaves isAuthenticated as false', async () => {
        await expect(
            useAuthStore.getState().register(
                'taken', 'Password1!', 'Password1!', 'john@example.com',
            ),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
    beforeEach(async () => {
        await useAuthStore.getState().login('john', 'Password1!');
    });

    it('sets isAuthenticated to false', async () => {
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('clears the user data', async () => {
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().user).toBeNull();
    });

    it('clears the access token', async () => {
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it('removes the refresh token cookie', async () => {
        await useAuthStore.getState().logout();
        expect(Cookies.get('refresh_token')).toBeUndefined();
    });

    it('clears user and auth state in localStorage after logout', async () => {
        await useAuthStore.getState().logout();
        const raw = localStorage.getItem('auth-storage');
        // Zustand's persist middleware re-saves the store after every set() call,
        // so the key is never null — but the persisted state must reflect
        // a logged-out user (no user, not authenticated).
        const stored = raw ? JSON.parse(raw) : null;
        expect(stored?.state?.user).toBeNull();
        expect(stored?.state?.isAuthenticated).toBe(false);
    });

    it('clears the store even when the server-side logout call fails', async () => {
        server.use(
            http.post(`${BASE}logout/`, () =>
                HttpResponse.json({}, { status: 500 }),
            ),
        );
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().accessToken).toBeNull();
    });
});

// ─── refreshToken ─────────────────────────────────────────────────────────────

describe('refreshToken', () => {
    it('returns true on a successful refresh', async () => {
        Cookies.set('refresh_token', 'valid-refresh');
        const result = await useAuthStore.getState().refreshToken();
        expect(result).toBe(true);
    });

    it('updates the access token in the store', async () => {
        Cookies.set('refresh_token', 'valid-refresh');
        await useAuthStore.getState().refreshToken();
        expect(useAuthStore.getState().accessToken).toBe(validAccessToken);
    });

    it('saves the new refresh token to the cookie when one is returned', async () => {
        Cookies.set('refresh_token', 'old-refresh');
        await useAuthStore.getState().refreshToken();
        expect(Cookies.get('refresh_token')).toBe('new-refresh-token');
    });

    it('returns false when no refresh token cookie exists', async () => {
        const result = await useAuthStore.getState().refreshToken();
        expect(result).toBe(false);
    });

    it('returns false when the refresh API responds with an error', async () => {
        server.use(
            http.post(`${BASE}token/refresh/`, () =>
                HttpResponse.json({ detail: 'Token expired' }, { status: 401 }),
            ),
        );
        Cookies.set('refresh_token', 'expired-refresh');
        const result = await useAuthStore.getState().refreshToken();
        expect(result).toBe(false);
    });

    it('logs the user out when the refresh fails', async () => {
        server.use(
            http.post(`${BASE}token/refresh/`, () =>
                HttpResponse.json({}, { status: 401 }),
            ),
        );
        Cookies.set('refresh_token', 'expired-refresh');
        await useAuthStore.getState().refreshToken();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});
