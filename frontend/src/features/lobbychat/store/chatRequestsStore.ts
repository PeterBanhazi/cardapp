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
      console.log("appyserverupdate:")
      console.log(req)
      set((state) => {
        state.requests[req.req_id] = req;
      });
    },

    syncFromServer(reqs) {
            console.log("syincfromserver:")
      console.log(reqs)
      set((state) => {
        reqs.forEach((r) => {
          state.requests[r.req_id] = r;
        });
      });
    },

    getRequestForPair(a, b) {
      const key = pairKey(a, b);
      return (
        Object.values(get().requests).find(
          (r) => pairKey(r.user_from, r.user_to) === key,
        ) ?? null
      );
    },
  })),
);
