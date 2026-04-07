import { create } from 'zustand';

interface ChatInputState {
    /** Map of userId → draft message text */
    drafts: Record<string, string>;

    /** Get the current draft for a given user (empty string if none) */
    getDraft: (userId: string) => string;

    /** Set / update the draft for a given user */
    setDraft: (userId: string, text: string) => void;

    /** Clear the draft for a given user (e.g. after sending) */
    clearDraft: (userId: string) => void;
}

export const useChatInputStore = create<ChatInputState>((set, get) => ({
    drafts: {},

    getDraft: (userId) => get().drafts[userId] ?? '',

    setDraft: (userId, text) =>
        set((state) => ({
            drafts: { ...state.drafts, [userId]: text },
        })),

    clearDraft: (userId) =>
        set((state) => {
            const next = { ...state.drafts };
            delete next[userId];
            return { drafts: next };
        }),
}));