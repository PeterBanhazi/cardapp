/**
 * useSystemSocket.ts
 * ─────────────────────────────────────────────────────────────
 * WebSocket hook that:
 *   • Connects to the Django Channels SystemConsumer
 *   • Routes incoming messages to the correct store action
 *   • Exposes sendAction() for the UI to fire chat actions
 *   • Handles reconnect with exponential backoff
 */

import { useEffect, useRef, useCallback } from "react";
import { useFriendsStore }      from "./friendsStore";
import { useChatRequestsStore } from "./chatRequestsStore";
import type { ChatAction, ChatRequest } from "./chatFSM";

// ── Types ────────────────────────────────────────────────────────────────────

interface SystemMessage {
  type:    "system_message";
  event:   string;
  payload: Record<string, unknown>;
}

interface UseSysSocketOptions {
  url:       string;
  username:  string;           // logged-in user
  enabled?:  boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSystemSocket({ url, username, enabled = true }: UseSysSocketOptions) {
  const wsRef         = useRef<WebSocket | null>(null);
  const retryDelay    = useRef(1_000);
  const retryTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const { syncPresence, setPresence }             = useFriendsStore.getState();
  const { applyServerUpdate, syncFromServer }      = useChatRequestsStore.getState();

  const handleMessage = useCallback((raw: MessageEvent<string>) => {
    let msg: SystemMessage;
    try { msg = JSON.parse(raw.data); }
    catch { return; }

    if (msg.type !== "system_message") return;

    const { event, payload } = msg;

    switch (event) {
      // ── Presence ──────────────────────────────────────────────────────
      case "presence_sync": {
        // Server sends these one-by-one on connect; we batch via syncPresence
        syncPresence([{
          username: payload.username as string,
          status:   payload.status as "online" | "offline",
        }]);
        break;
      }
      case "presence_update": {
        setPresence(
          payload.username as string,
          payload.status   as "online" | "offline",
        );
        break;
      }

      // ── Chat requests ──────────────────────────────────────────────────
      case "chat_request": {
        // Covers ALL state transitions — server always sends full req object
        const req = payload as unknown as ChatRequest;

        // Wipe any optimistic placeholder for this pair before applying
        // (the server might be confirming a "send_request" with a real req_id)
        applyServerUpdate(req);
        break;
      }

      // ── Reconnect state sync ───────────────────────────────────────────
      case "state_sync": {
        // If the backend ever batches sync (future), handle it here.
        // For now presence_sync + chat_request events handle it individually.
        const reqs = payload.requests as ChatRequest[] | undefined;
        if (reqs) syncFromServer(reqs);
        break;
      }

      case "chat_request_error": {
        console.warn("[SystemSocket] chat_request_error", payload.detail);
        // The consumer reverts any optimistic state when it receives this.
        // The req_id to revert is in payload.req_id if sent by the server.
        const reqId = payload.req_id as string | undefined;
        if (reqId) useChatRequestsStore.getState().revertOptimistic(reqId);
        break;
      }

      default:
        break;
    }
  }, [syncPresence, setPresence, applyServerUpdate, syncFromServer]);

  const connect = useCallback(() => {
    if (!enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryDelay.current = 1_000;

      // Heartbeat keeps Redis TTL alive
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "heartbeat" }));
        }
      }, 55_000);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      retryTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
        connect();
      }, retryDelay.current);
    };

    ws.onerror = () => ws.close();
  }, [url, enabled, handleMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryTimer.current)   clearTimeout(retryTimer.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [connect]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const sendAction = useCallback((
    action:  ChatAction,
    payload: Record<string, unknown>,
  ) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ action, ...payload }));
  }, []);

  return { sendAction };
}
