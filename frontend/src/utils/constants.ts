export const API_BASE_URL = 'http://localhost:8000/api/';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

