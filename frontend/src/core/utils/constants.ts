const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

export const API_BASE_URL = `${API_URL}/api/`;
export const WS_BASE_URL = WS_URL;
export const HEARTBEAT_INTERVAL = 60000;
export const WS_CONNECT_OPTIONS = {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: (attempt:number) =>
    Math.min(1000 * 2 ** attempt, 15000),
  // Add any other react-use-websocket options here
};
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: import.meta.env.MODE === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

