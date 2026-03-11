import { useAuthStore } from '../../core/store/useAuthStore';
import { WS_BASE_URL } from '../../core/utils/constants';
import {
    WS_CONNECT_OPTIONS,
    HEARTBEAT_INTERVAL,
} from '../../core/utils/constants';
import { WebSocketStatusManager } from '../../core/store/useFriendsStore';

export const WebSocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const accessToken = useAuthStore().accessToken;
    const socketUrl = `${WS_BASE_URL}ws/system/?token=${accessToken}`;

    // useWebSocketConnection(socketUrl, WS_CONNECT_OPTIONS);
    WebSocketStatusManager(socketUrl, WS_CONNECT_OPTIONS);
    return <>{children}</>;
};
