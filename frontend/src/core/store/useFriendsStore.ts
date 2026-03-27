import { useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HEARTBEAT_INTERVAL } from '../../core/utils/constants';

import { useAuthStore } from './useAuthStore';
import { useChatRequestsStore } from '@/features/lobbychat/store/chatRequestsStore';
import type { ChatAction, ChatRequest } from '@/features/lobbychat/store/chatFSM';
import { Friend } from '@/shared/types/friend';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatusMessage {
    type: 'system_message';
    event: string;
    // All events carry their data inside payload
    payload: Record<string, any>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface FriendsState {
    friends: Record<string, Friend>;
    isConnected: boolean;
    sendMessage: ((message: string) => void) | null;

    setFriendStatus: (user: string, status: Friend['status']) => void;
    setConnected: (connected: boolean) => void;
    setSendMessage: (sendFn: ((message: string) => void) | null) => void;

    // Generic action sender — used directly by ChatActionButton
    sendAction: (action: ChatAction, payload: Record<string, unknown>) => void;

    // Legacy named helpers (kept for backward compat, delegate to sendAction)
    sendChatRequest: (user: string) => void;
    sendClosedChat: (user: string) => void;
    sendAcceptChatRequest: (user: string) => void;
    sendRejectChatRequest: (user: string) => void;
    sendCancelledChat: (user: string) => void;

    resetFriends: () => void;
}

export const useFriendsStore = create<FriendsState>()(
    devtools((set, get) => ({
        friends: {},
        isConnected: false,
        sendMessage: null,

        setFriendStatus: (user: string, status: Friend['status']) => {
            set(
                (state) => ({
                    friends: {
                        ...state.friends,
                        [user]: { user, status },
                    },
                }),
                undefined,
                'setFriendStatus',
            );
        },

        setConnected: (connected: boolean) => set({ isConnected: connected }),

        setSendMessage: (sendFn: ((message: string) => void) | null) =>
            set({ sendMessage: sendFn }),

        // ── Generic sender — used by ChatActionButton ─────────────────────────
        // `payload` must contain `action` (the WS handler name), `user_from`, `user_to`
        // and optionally `req_id`. ChatActionButton already builds this shape via
        // its WS_HANDLER map, so we just forward it.
        sendAction: (action: ChatAction, payload: Record<string, unknown>) => {
            const { sendMessage, isConnected } = get();
            if (!sendMessage || !isConnected) {
                console.warn('[FriendsStore] sendAction: WebSocket not connected');
                return;
            }
            const message = JSON.stringify({
                type: 'system_message',
                ...payload, // spreads action, user_from, user_to, req_id
            });
            sendMessage(message);
            console.log('[FriendsStore] sendAction:', action, payload);
        },

        // ── Legacy helpers ────────────────────────────────────────────────────
        sendChatRequest: (user: string) => {
            const username = useAuthStore.getState().user?.username ?? '';
            get().sendAction('send_request', {
                action:    'chat_request',
                user_from: username,
                user_to:   user,
            });
        },
        sendAcceptChatRequest: (user: string) => {
            const username = useAuthStore.getState().user?.username ?? '';
            get().sendAction('accept', {
                action:    'accept_chat',
                user_from: username,
                user_to:   user,
            });
        },
        sendRejectChatRequest: (user: string) => {
            const username = useAuthStore.getState().user?.username ?? '';
            get().sendAction('reject', {
                action:    'reject_chat',
                user_from: username,
                user_to:   user,
            });
        },
        sendCancelledChat: (user: string) => {
            const username = useAuthStore.getState().user?.username ?? '';
            get().sendAction('cancel', {
                action:    'cancel_chat',
                user_from: username,
                user_to:   user,
            });
        },
        sendClosedChat: (user: string) => {
            const username = useAuthStore.getState().user?.username ?? '';
            get().sendAction('close', {
                action:    'close_chat',
                user_from: username,
                user_to:   user,
            });
        },

        resetFriends: () =>
            set({ friends: {}, isConnected: false, sendMessage: null }),
    })),
);

// ── WebSocketStatusManager ────────────────────────────────────────────────────
// Owns the single WS connection for the whole app.
// Routes presence AND chat-request events to their respective stores.

export const useWebSocketStatusManager = (url: string |null, options: any = {}) => {
    const setFriendStatus = useFriendsStore(s => s.setFriendStatus);
    const setConnected = useFriendsStore(s => s.setConnected);
    const setSendMessage = useFriendsStore(s => s.setSendMessage);
    const resetFriends = useFriendsStore(s => s.resetFriends);

    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

    const { lastMessage, readyState, sendMessage } = useWebSocket(url, {
        onOpen: () => {
            console.log('WebSocket connection opened');
            setConnected(true);
            startHeartbeat(sendMessage);
        },
        onClose: () => {
            console.log('WebSocket connection closed');
            stopHeartbeat();
            setConnected(false);
            resetFriends();
        },
        onError: () => {
            console.error('WebSocket error:', "systemWs error");
            setConnected(false);
        },
        ...options,
    });

    // Keep sendMessage reference in store so sendAction (and legacy helpers) work
    useEffect(() => {
        setSendMessage(readyState === ReadyState.OPEN ? sendMessage : null);
    }, [readyState, sendMessage]);

    // ── Message router ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!lastMessage) return;

        let msg: StatusMessage;
        try {
            msg = JSON.parse(lastMessage.data);
        } catch {
            console.error('[WebSocketStatusManager] Failed to parse message');
            return;
        }

        if (msg.type !== 'system_message') return;

        const { event, payload } = msg;
        const { applyServerUpdate, syncFromServer } =
            useChatRequestsStore.getState();

        switch (event) {
            // ── Presence ──────────────────────────────────────────────────────
            // payload: { username, status }
            case 'presence_sync':
            case 'presence_update': {
                setFriendStatus(payload.username, payload.status);
                break;
            }

            // ── Chat-request FSM transitions ──────────────────────────────────
            // payload IS the full req dict from _broadcast_to_pair:
            //   { req_id, user_from, user_to, status, created_at, updated_at, … }
            case 'chat_request':
            case 'chat_request_received':
            case 'chat_request_accepted':
            case 'chat_request_rejected':
            case 'cancel_chat':
            case 'chat_closed': {
                applyServerUpdate(payload as ChatRequest);

                // Also keep legacy friend-status flags in sync
                if (payload.user_from) setFriendStatus(payload.user_from, payload.status);
                if (payload.user_to)   setFriendStatus(payload.user_to,   payload.status);
                break;
            }

            // ── Reconnect bulk sync ───────────────────────────────────────────
            // payload: { requests: ChatRequest[] }
            case 'state_sync': {
                if (Array.isArray(payload.requests)) {
                    syncFromServer(payload.requests);
                }
                break;
            }

            default:
                break;
        }
    }, [lastMessage]);

    useEffect(() => {
        setConnected(readyState === ReadyState.OPEN);
    }, [readyState]);

    function startHeartbeat(sendFn: (msg: string) => void) {
        stopHeartbeat();
        heartbeatRef.current = setInterval(() => {
            sendFn(JSON.stringify({ type: 'system_message', action: 'heartbeat' }));
        }, HEARTBEAT_INTERVAL);
    }

    function stopHeartbeat() {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    }

    return null;
};
