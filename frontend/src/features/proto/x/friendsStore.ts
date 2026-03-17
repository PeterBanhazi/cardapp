/**
 * friendsStore.ts
 * ─────────────────────────────────────────────────────────────
 * Zustand store for the friends list and their online presence.
 *
 * Handles:
 *   • Initial population from REST on mount
 *   • presence_sync  — full snapshot pushed by server on (re)connect
 *   • presence_update — single user came online / went offline
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// ── Types ───────────────────────────────────────────────────────────────────

export type PresenceStatus = "online" | "offline" | "unknown";

export interface Friend {
  friend_username:   string;
  display_name?: string;
  avatar_url?:   string;
  status:     PresenceStatus;
  status_updated_at: number;   // Date.now() ms — used to debounce rapid flips
}

interface FriendsState {
  friends:    Record<string, Friend>;   // keyed by username
  loaded:     boolean;

  // Called once on mount with the full friends list from REST
  initFriends: (list: Pick<Friend, "friend_username" >[]) => void;

  // Called on WS "presence_sync" event (arrives on every (re)connect)
  syncPresence: (updates: { username: string; status: PresenceStatus }[]) => void;

  // Called on WS "presence_update" event (single user flip)
  setPresence: (username: string, status: PresenceStatus) => void;

  // Helpers
  getFriend:  (username: string) => Friend | undefined;
  onlineFriends: () => Friend[];
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useFriendsStore = create<FriendsState>()(
  immer((set, get) => ({
    friends: {},
    loaded:  false,

    initFriends(list) {
      set(state => {
        list.forEach(f => {
          // Preserve existing presence status if we already have the friend
          const existing = state.friends[f.friend_username];
          state.friends[f.friend_username] = {
            friend_username:          f.friend_username,
            display_name:      f.friend_username,
            // avatar_url:        f.avatar_url,
            status:            existing?.status ?? "unknown",
            status_updated_at: existing?.status_updated_at ?? 0,
          };
        });
        state.loaded = true;
      });
    },

    syncPresence(updates) {
      // Server-authoritative snapshot — overwrite all presence values
      set(state => {
        const now = Date.now();
        updates.forEach(({ username, status }) => {
          if (state.friends[username]) {
            state.friends[username].status            = status;
            state.friends[username].status_updated_at = now;
          }
        });
      });
    },

    setPresence(username, status) {
      set(state => {
        if (!state.friends[username]) return;

        const friend = state.friends[username];
        const now    = Date.now();

        // Debounce: ignore a flip that arrives within 300 ms of the last one.
        // Prevents the "offline → online" flicker on browser refresh.
        if (now - friend.status_updated_at < 300) return;

        friend.status            = status;
        friend.status_updated_at = now;
      });
    },

    getFriend: username => get().friends[username],

    onlineFriends: () =>
      Object.values(get().friends).filter(f => f.status === "online"),
  })),
);
