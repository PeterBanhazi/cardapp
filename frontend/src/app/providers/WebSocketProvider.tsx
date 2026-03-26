import { useAuthStore } from '../../core/store/useAuthStore';
import { WS_BASE_URL } from '../../core/utils/constants';
import { WS_CONNECT_OPTIONS } from '../../core/utils/constants';
import { useWebSocketStatusManager } from '../../core/store/useFriendsStore';
import { useEffect } from 'react';

export const WebSocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const username = useAuthStore((s) => s.user?.username);
    const accessToken = useAuthStore((s) => s.accessToken);

    const socketUrl =
        username && accessToken
            ? `${WS_BASE_URL}ws/system/?token=${accessToken}`
            : null;

    useWebSocketStatusManager(socketUrl, WS_CONNECT_OPTIONS);
    return <>{children}</>;
};
