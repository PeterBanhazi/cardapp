/**
 * src/test/jwtHelper.ts
 *
 * Minimal JWT factory for tests.
 * Produces a real base64url-structured token — jwtDecode can parse it,
 * no valid signature needed (decode-only, no verification).
 */

export const futureExp  = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
export const expiredExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

export const makeJwt = (payload: object): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const body   = btoa(JSON.stringify(payload)).replace(/=/g, '');
    return `${header}.${body}.fakesignature`;
};

export const validAccessToken = makeJwt({
    user_id:  '42',
    username: 'testjohn',
    exp: futureExp,
    iat: Math.floor(Date.now() / 1000),
});

export const expiredAccessToken = makeJwt({
    user_id:  '42',
    username: 'testjohn',
    exp: expiredExp,
    iat: expiredExp - 3600,
});
