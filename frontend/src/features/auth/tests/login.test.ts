/**
 * src/core/store/tests/login.test.ts
 *
 * Unit tests for the login flow in useAuthStore.
 * MSW lifecycle is managed globally in src/test/setup.ts.
 * Default handlers live in src/test/mswServer.ts.
 * Per-test overrides use server.use(...) inside beforeEach blocks.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import Cookies from 'js-cookie';

import { useAuthStore } from '@/core/store/useAuthStore';
import { server, validAccessToken } from '../../../test/mswServer';
import { API_BASE_URL as BASE } from '@/core/utils/constants';



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

// ─── login — success ──────────────────────────────────────────────────────────

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

    it('sets isLoading to false after success', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('clears any previous error on success', async () => {
        useAuthStore.setState({ error: 'Previous error' });
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('falls back to the submitted username if JWT has no username claim', async () => {
        // Override handler to return a token without username in payload
        const { makeJwt, futureExp } = await import('../../../test/jwtHelper');
        const tokenWithoutUsername = makeJwt({
            user_id: '99',
            exp: futureExp,
            iat: Math.floor(Date.now() / 1000),
        });
        server.use(
            http.post(`${BASE}token/`, () =>
                HttpResponse.json({
                    access:  tokenWithoutUsername,
                    refresh: 'mock-refresh-token',
                }),
            ),
        );
        await useAuthStore.getState().login('fallback_user', 'Password1!');
        expect(useAuthStore.getState().user?.username).toBe('fallback_user');
    });
});

// ─── login — failure ──────────────────────────────────────────────────────────

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

    it('sets a generic error message — raw server response is not exposed', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().error).toBe(
            'Login failed. Please check your credentials.',
        );
    });

    it('leaves isAuthenticated as false', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('leaves accessToken as null', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it('leaves the refresh token cookie unset', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong'),
        ).rejects.toThrow();
        expect(Cookies.get('refresh_token')).toBeUndefined();
    });

    it('sets isLoading to false after failure', async () => {
        await expect(
            useAuthStore.getState().login('john', 'wrong'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isLoading).toBe(false);
    });
});

// ─── login — network error ────────────────────────────────────────────────────

describe('login — network error', () => {
    beforeEach(() => {
        server.use(
            http.post(`${BASE}token/`, () => HttpResponse.error()),
        );
    });

    it('sets an error message on network failure', async () => {
        await expect(
            useAuthStore.getState().login('john', 'Password1!'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().error).toBeTruthy();
    });

    it('leaves isAuthenticated as false on network failure', async () => {
        await expect(
            useAuthStore.getState().login('john', 'Password1!'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('sets isLoading to false after network failure', async () => {
        await expect(
            useAuthStore.getState().login('john', 'Password1!'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isLoading).toBe(false);
    });
});

// ─── login — server error ─────────────────────────────────────────────────────

describe('login — server error (500)', () => {
    beforeEach(() => {
        server.use(
            http.post(`${BASE}token/`, () =>
                HttpResponse.json({ detail: 'Internal server error' }, { status: 500 }),
            ),
        );
    });

    it('sets a generic error message on 500', async () => {
        await expect(
            useAuthStore.getState().login('john', 'Password1!'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().error).toBe(
            'Login failed. Please check your credentials.',
        );
    });

    it('leaves isAuthenticated as false on 500', async () => {
        await expect(
            useAuthStore.getState().login('john', 'Password1!'),
        ).rejects.toThrow();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});

// ─── clearError ──────────────────────────────────────────────────────────────

describe('clearError — login context', () => {
    it('clears a login error', () => {
        useAuthStore.setState({ error: 'Login failed. Please check your credentials.' });
        useAuthStore.getState().clearError();
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('typing in username field should clear the error (clearError called on change)', () => {
        // Simulates the onChange handler: setUsername + clearError
        useAuthStore.setState({ error: 'Login failed. Please check your credentials.' });
        useAuthStore.getState().clearError();
        expect(useAuthStore.getState().error).toBeNull();
    });
});

// ─── login followed by logout ─────────────────────────────────────────────────

describe('login → logout sequence', () => {
    it('is unauthenticated after logging in then out', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        expect(useAuthStore.getState().isAuthenticated).toBe(true);

        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('clears accessToken after login → logout', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it('clears user data after login → logout', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().user).toBeNull();
    });

    it('clears the refresh token cookie after login → logout', async () => {
        await useAuthStore.getState().login('john', 'Password1!');
        await useAuthStore.getState().logout();
        expect(Cookies.get('refresh_token')).toBeUndefined();
    });
});
