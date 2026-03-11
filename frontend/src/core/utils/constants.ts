export const API_BASE_URL = 'http://localhost:8000/api/';
export const WS_BASE_URL = 'ws://localhost:9000/';
export const HEARTBEAT_INTERVAL = 60000;
export const WS_CONNECT_OPTIONS = {
    reconnectAttempts: 10,
    reconnectInterval: (attempt:number) =>
    Math.min(1000 * 2 ** attempt, 15000),
  // Add any other react-use-websocket options here
};
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

