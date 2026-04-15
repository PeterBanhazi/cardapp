/**
 * chatRequestsStore.ts
 * ─────────────────────────────────────────────────────────────
 * Egyszerű store — nincs optimistic update.
 * A szerver az egyetlen igazság forrás minden állapothoz.
 *
 * Handles:
 *   • chat_request WS events → applyServerUpdate (mindig felülír)
 *   • state sync reconnect-nél → syncFromServer
 *   • per-pair lookup a gomb számára
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type ChatRequest } from "./chatFSM";
import { useChatStore } from "@/core/store/useChatStore";
import { useAuthStore } from "@/core/store/useAuthStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export const TERMINAL_STATUSES = new Set([
  "rejected",
  "cancelled",
  "closed",
] as const);

export type TerminalStatus = "rejected" | "cancelled" | "closed";

interface ChatRequestsState {
  // req_id → ChatRequest — csak a szervertől jövő adat
  requests: Record<string, ChatRequest>;

  // ── Server events ─────────────────────────────────────────────────────
  /** Minden "chat_request" WS üzenetre hívódik — szerver mindig nyer */
  applyServerUpdate: (req: ChatRequest) => void;

  /** Reconnect-nél: a szerver az összes aktív request-et újraküldi */
  syncFromServer: (reqs: ChatRequest[]) => void;

  // ── Query ──────────────────────────────────────────────────────────────
  /** A két felhasználó közötti aktuális request, vagy null */
  getRequestForPair: (a: string, b: string) => ChatRequest | null;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useChatRequestsStore = create<ChatRequestsState>()(
  immer((set, get) => ({
    requests: {},

    applyServerUpdate(req) {
        set((state) => {
            // Ha új pending jön ugyanarra a párra, töröld a régi terminal rekordot
            if (req.status === 'pending') {
                const key = pairKey(req.user_from, req.user_to);
                Object.keys(state.requests).forEach((id) => {
                    const old = state.requests[id];
                    if (
                        id !== req.req_id &&
                        pairKey(old.user_from, old.user_to) === key &&
                        TERMINAL_STATUSES.has(old.status as any)
                    ) {
                        delete state.requests[id];
                    }
                });
            }
            state.requests[req.req_id] = req;
        });
      
    // Chat megnyitása active állapotban — mindkét félnél fut,
    // openChat idempotent: ha már nyitva van, csak activeChatUser-t vált
      if (req.status === 'active') {
        const localUser = useAuthStore.getState().user?.username;
        if (!localUser) return;

        const friendUser =
            req.user_from === localUser ? req.user_to : req.user_from;

        useChatStore.getState().openChat(friendUser);
    }
    },

    syncFromServer(reqs) {
      set((state) => {
        reqs.forEach((r) => {
          state.requests[r.req_id] = r;
        });
      });
    },

    getRequestForPair(a, b) {
    const key = pairKey(a, b);
    const matches = Object.values(get().requests).filter(
        (r) => pairKey(r.user_from, r.user_to) === key,
      );
      // ensure that it's the last stage update:       
    if (matches.length === 0) return null;
    return matches.reduce((latest, r) =>
        r.updated_at > latest.updated_at ? r : latest
    );
},
  
  })),
);
