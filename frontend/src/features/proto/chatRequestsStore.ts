/**
 * chatRequestsStore.ts
 * ─────────────────────────────────────────────────────────────
 * Zustand store for chat request state, driven by the FSM.
 *
 * Handles:
 *   • chat_request WS events (any status — server is source of truth)
 *   • Optimistic local mutations (reverted on error)
 *   • State sync on reconnect  (server re-sends active requests)
 *   • Per-pair lookups for UI buttons
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type ChatRequest, type ChatAction, applyOptimistic, canAct } from "./chatFSM";

// ── Types ───────────────────────────────────────────────────────────────────
export const TERMINAL_STATES = new Set(["rejected", "cancelled", "closed"] as const);
export type TerminalStatus = "rejected" | "cancelled" | "closed";

type OptimisticEntry = {
  previousRequest: ChatRequest | null;
  action:          ChatAction;
  timestamp:       number;
};

interface ChatRequestsState {
  // req_id → ChatRequest
  requests: Record<string, ChatRequest>;

  // Optimistic mutations: req_id → snapshot before the mutation
  // Used to roll back if the server returns an error
  optimistic: Record<string, OptimisticEntry>;
    /** req_ids the user has locally dismissed — hidden until server sends a new state */
  dismissed:  Set<string>;

  // ── Server events ──────────────────────────────────────────────────────

  /** Called with every incoming "chat_request" WS payload. */
  applyServerUpdate: (req: ChatRequest) => void;

  /** Called on reconnect: server sends all active requests. Replaces stale state. */
  syncFromServer: (reqs: ChatRequest[]) => void;

  // ── Local optimistic mutations (called BEFORE sending WS action) ───────

  /**
   * Optimistically apply an action.
   * Returns false (and does nothing) if the FSM rejects the action.
   */
  optimisticallyApply: (
    action:    ChatAction,
    reqId:     string | null,    // null when action === "send_request"
    localUser: string,
    skeleton?: Partial<ChatRequest>, // for send_request: provide user_from, user_to
  ) => boolean;

  /** Called when the server confirms — removes the optimistic lock. */
  confirmOptimistic: (reqId: string) => void;

  /** Called on server error — reverts the optimistic mutation. */
  revertOptimistic: (reqId: string) => void;

    /**
   * Local-only dismiss for terminal states (rejected / cancelled / closed).
   * Hides the request so the button returns to idle "Start Chat".
   * If the server sends a new state for this pair afterwards, it takes over.
   */
  dismissRequest: (reqId: string) => void;

  // ── Queries ────────────────────────────────────────────────────────────

  /** Returns the active request between two users (any status), or null. */
  getRequestForPair: (a: string, b: string) => ChatRequest | null;

  /** True while an optimistic mutation is in flight for this req_id. */
  isPending: (reqId: string) => boolean;

  /** True if send_request optimistic is in flight for this pair. */
  isSendingRequest: (userFrom: string, userTo: string) => boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const OPTIMISTIC_TIMEOUT_MS = 8_000; // auto-revert after 8 s if server goes quiet

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
        // Server update is authoritative — always wins over optimistic state
        state.requests[req.req_id] = req;
        // Confirm any optimistic lock for this req
        delete state.optimistic[req.req_id];
          // Server update always lifts a dismiss — new state from server wins
              
      });
    },

    syncFromServer(reqs) {
      set(state => {
        // On reconnect: replace ALL active requests with server snapshot.
        // We keep terminal states (rejected/cancelled/closed) in place
        // only if the server didn't send a replacement — they might be
        // needed for UI history.
        const incoming: Record<string, ChatRequest> = {};
        reqs.forEach(r => { incoming[r.req_id] = r;state.dismissed.delete(r.req_id) }
          
        );

        // Merge: server snapshot wins for active requests
        Object.values(incoming).forEach(r => {
          state.requests[r.req_id] = r;
          state.dismissed.delete(r.req_id)
        });

        // Wipe stale optimistic locks — server state is now truth
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
      const state  = get();
      const req    = reqId ? (state.requests[reqId] ?? null) : null;

      if (!canAct(action, req, localUser)) return false;

      const nextStatus = applyOptimistic(action, req);
      if (!nextStatus) return false;

      const now = Date.now();

      set(draft => {
        if (action === "send_request") {
          // Create a temporary placeholder (req_id will be replaced by server)
          const tempId = `optimistic:${now}`;
          const placeholder: ChatRequest = {
            req_id:     tempId,
            user_from:  localUser,
            user_to:    skeleton?.user_to ?? "",
            status:     "pending",
            created_at: Math.floor(now / 1000),
            updated_at: Math.floor(now / 1000),
          };
          draft.requests[tempId]   = placeholder;
          draft.optimistic[tempId] = { previousRequest: null, action, timestamp: now };
        } else if (req && reqId) {
          draft.optimistic[reqId] = {
            previousRequest: { ...req },
            action,
            timestamp: now,
          };
          draft.requests[reqId] = { ...req, status: nextStatus, updated_at: Math.floor(now / 1000) };
        }
      });

      // Safety net: auto-revert if server never responds
      setTimeout(() => {
        const o = get().optimistic[reqId ?? `optimistic:${now}`];
        if (o && o.timestamp === now) {
          get().revertOptimistic(reqId ?? `optimistic:${now}`);
        }
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
          delete state.requests[reqId]; // was a failed send_request placeholder
        }
        delete state.optimistic[reqId];
      });
    },

    // ── Queries ──────────────────────────────────────────────────────────────

    getRequestForPair(a, b) {
      const key = pairKey(a, b);
      return (
        Object.values(get().requests).find(r =>
          pairKey(r.user_from, r.user_to) === key,
        ) ?? null
      );
    },

    isPending(reqId) {
      return reqId in get().optimistic;
    },

    isSendingRequest(userFrom, userTo) {
      return Object.values(get().optimistic).some(
        o =>
          o.action === "send_request" &&
          get().requests[Object.keys(get().optimistic).find(
            k => get().optimistic[k] === o,
          ) ?? ""]?.user_to === userTo,
      );
    },
  })),
);