import { useAuthStore } from '../store/useAuthStore';
import { WS_BASE_URL } from '../utils/constants';
import { WS_CONNECT_OPTIONS } from '../utils/constants';
import { useWebSocketConnection } from '../store/wsHooks';

export const WebSocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const accessToken = useAuthStore().accessToken;
    const socketUrl = `${WS_BASE_URL}ws/status/?token=${accessToken}`;

    useWebSocketConnection(socketUrl, WS_CONNECT_OPTIONS);

    return <>{children}</>;
};
