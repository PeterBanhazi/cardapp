/**
 * src/test/mswServer.ts
 *
 * Central MSW server — default handlers for all test files.
 * Individual tests can override specific routes with server.use(...).
 *
 * Lifecycle is managed in src/test/setup.ts:
 *   beforeAll  → server.listen()
 *   afterEach  → server.resetHandlers()   ← restores these defaults
 *   afterAll   → server.close()
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { makeJwt, futureExp } from './jwtHelper';

export const BASE = "http://localhost:8000/api/"
export const validAccessToken = makeJwt({
    user_id:  '42',
    username: 'testjohn',
    exp: futureExp,
    iat: Math.floor(Date.now() / 1000),
});

export const handlers = [
    http.post(`${BASE}token/`, () =>
        HttpResponse.json({
            access:  validAccessToken,
            refresh: 'mock-refresh-token',
        }),
    ),

    http.post(`${BASE}register/`, () =>
        HttpResponse.json({ detail: 'User created.' }, { status: 201 }),
    ),

    http.post(`${BASE}logout/`, () =>
        HttpResponse.json({ detail: 'Logged out.' }),
    ),

    http.post(`${BASE}token/refresh/`, () =>
        HttpResponse.json({
            access:  validAccessToken,
            refresh: 'new-refresh-token',
        }),
    ),
];

export const server = setupServer(...handlers);
