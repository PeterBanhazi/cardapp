/**
 * chatRequestsStore.ts
 * ─────────────────────────────────────────────────────────────
 * Zustand store for chat request state, driven by the FSM.
 *
 * Handles:
 *   • chat_request WS events (any status — server is source of truth)
 *   • Optimistic local mutations (reverted on error)
 *   • State sync on reconnect (server re-sends active requests)
 *   • dismissRequest() — local-only idle reset for terminal states
 *   • Per-pair lookups for UI buttons
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type ChatRequest, type ChatAction, applyOptimistic, canAct } from "./chatFSM";

// ── Types ───────────────────────────────────────────────────────────────────

/** Terminal states where the button can be dismissed to idle locally */
export const TERMINAL_STATES = new Set(["rejected", "cancelled", "closed"] as const);
export type TerminalStatus = "rejected" | "cancelled" | "closed";

type OptimisticEntry = {
  previousRequest: ChatRequest | null;
  action:          ChatAction;
  timestamp:       number;
};

interface ChatRequestsState {
  requests:   Record<string, ChatRequest>;
  optimistic: Record<string, OptimisticEntry>;

  /** req_ids the user has locally dismissed — hidden until server sends a new state */
  dismissed:  Set<string>;

  // ── Server events ──────────────────────────────────────────────────────
  applyServerUpdate: (req: ChatRequest) => void;
  syncFromServer:    (reqs: ChatRequest[]) => void;

  // ── Optimistic mutations ───────────────────────────────────────────────
  optimisticallyApply: (
    action:    ChatAction,
    reqId:     string | null,
    localUser: string,
    skeleton?: Partial<ChatRequest>,
  ) => boolean;
  confirmOptimistic: (reqId: string) => void;
  revertOptimistic:  (reqId: string) => void;

  /**
   * Local-only dismiss for terminal states (rejected / cancelled / closed).
   * Hides the request so the button returns to idle "Start Chat".
   * If the server sends a new state for this pair afterwards, it takes over.
   */
  dismissRequest: (reqId: string) => void;

  // ── Queries ────────────────────────────────────────────────────────────
  getRequestForPair: (a: string, b: string) => ChatRequest | null;
  isPending:         (reqId: string) => boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const OPTIMISTIC_TIMEOUT_MS = 8_000;

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useChatRequestsStore = create<ChatRequestsState>()(
  immer((set, get) => ({
    requests:   {},
    optimistic: {},
    dismissed:  new Set<string>(),

    // ── Server events ────────────────────────────────────────────────────────

    applyServerUpdate(req) {
      set(state => {
        state.requests[req.req_id] = req;
        delete state.optimistic[req.req_id];
        // Server update always lifts a dismiss — new state from server wins
        state.dismissed.delete(req.req_id);
      });
    },

    syncFromServer(reqs) {
      set(state => {
        reqs.forEach(r => {
          state.requests[r.req_id] = r;
          state.dismissed.delete(r.req_id);   // server is truth, clear any dismiss
        });
        state.optimistic = {};
      });
    },

    // ── Dismiss (local only, no WS message) ──────────────────────────────────

    dismissRequest(reqId) {
      set(state => {
        const req = state.requests[reqId];
        // Only allow dismiss on terminal states
        if (!req || !TERMINAL_STATES.has(req.status as TerminalStatus)) return;
        state.dismissed.add(reqId);
      });
    },

    // ── Optimistic mutations ─────────────────────────────────────────────────

    optimisticallyApply(action, reqId, localUser, skeleton) {
      const state = get();
      const req   = reqId ? (state.requests[reqId] ?? null) : null;

      if (!canAct(action, req, localUser)) return false;

      const nextStatus = applyOptimistic(action, req);
      if (!nextStatus) return false;

      const now = Date.now();

      set(draft => {
        if (action === "send_request") {
          const tempId = `optimistic:${now}`;
          draft.requests[tempId] = {
            req_id:     tempId,
            user_from:  localUser,
            user_to:    skeleton?.user_to ?? "",
            status:     "pending",
            created_at: Math.floor(now / 1000),
            updated_at: Math.floor(now / 1000),
          };
          draft.optimistic[tempId] = { previousRequest: null, action, timestamp: now };
        } else if (req && reqId) {
          draft.optimistic[reqId] = { previousRequest: { ...req }, action, timestamp: now };
          draft.requests[reqId]   = { ...req, status: nextStatus, updated_at: Math.floor(now / 1000) };
        }
      });

      // Auto-revert safety net
      const targetId = action === "send_request" ? `optimistic:${now}` : (reqId ?? "");
      setTimeout(() => {
        const o = get().optimistic[targetId];
        if (o && o.timestamp === now) get().revertOptimistic(targetId);
      }, OPTIMISTIC_TIMEOUT_MS);

      return true;
    },

    confirmOptimistic(reqId) {
      set(state => { delete state.optimistic[reqId]; });
    },

    revertOptimistic(reqId) {
      set(state => {
        const o = state.optimistic[reqId];
        if (!o) return;
        if (o.previousRequest) {
          state.requests[reqId] = o.previousRequest;
        } else {
          delete state.requests[reqId];
        }
        delete state.optimistic[reqId];
      });
    },

    // ── Queries ──────────────────────────────────────────────────────────────

    getRequestForPair(a, b) {
      const key = pairKey(a, b);
      const store = get();
      const match = Object.values(store.requests).find(r =>
        pairKey(r.user_from, r.user_to) === key,
      );
      // Return null if dismissed so the button renders as idle
      if (match && store.dismissed.has(match.req_id)) return null;
      return match ?? null;
    },

    isPending(reqId) {
      return reqId in get().optimistic;
    },
  })),
);
