import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, SendHorizontal, ThumbsUp } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import EmojiPicker from './EmojiPicker';
import { usePreferences } from '../../store/usePreferences';
import useSound from 'use-sound';

import { useChatStore } from '../../../../core/store/useChatStore';
import { useChatInputStore } from './useChatInputStore';

/**
 * ChatBottomBar
 *
 * Key behaviour:
 * - Draft text is stored per-user in `useChatInputStore` so switching
 *   conversations preserves each user's unsent message.
 * - The <Textarea> receives `key={activeChatUser?.id}` so React fully
 *   remounts the controlled input whenever the active chat changes —
 *   this eliminates the "uncontrolled → controlled" warning and
 *   ensures the cursor / scroll position resets correctly.
 */
function ChatBottomBar() {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const { soundEnabled } = usePreferences();

    const { activeChatUser, sendChatMessage } = useChatStore();

    const { getDraft, setDraft, clearDraft } = useChatInputStore();

    // Derive the current draft from the store; falls back to '' for new chats.
    const messageInput = activeChatUser ? getDraft(activeChatUser) : '';

    // ── Keystroke sounds ────────────────────────────────────────────────────
    const [playSound1] = useSound('/sounds/keystroke1.mp3');
    const [playSound2] = useSound('/sounds/keystroke2.mp3');
    const [playSound3] = useSound('/sounds/keystroke3.mp3');
    const [playSound4] = useSound('/sounds/keystroke4.mp3');
    const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4];

    const playRandomKeyStrokeSound = () => {
        if (!soundEnabled) return;
        const randomIndex = Math.floor(
            Math.random() * playSoundFunctions.length
        );
        playSoundFunctions[randomIndex]();
    };

    // ── Focus textarea whenever the active user changes ─────────────────────
    useEffect(() => {
        textAreaRef.current?.focus();
    }, [activeChatUser]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSendMessage = () => {
        if (!activeChatUser) return;

        const trimmed = messageInput.trim();
        if (!trimmed) return;

        sendChatMessage(activeChatUser, trimmed);
        clearDraft(activeChatUser);
        textAreaRef.current?.focus();
    };

    const handleLikeClick = () => {
        if (!activeChatUser) return;
        // Sends a 👍 as a quick reaction — adjust to your own sendChatMessage signature.
        sendChatMessage(activeChatUser, '👍');
        textAreaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        // Shift+Enter: allow natural newline — no explicit setDraft needed
        // because the onChange handler fires immediately after.
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!activeChatUser) return;
        setDraft(activeChatUser, e.target.value);
        playRandomKeyStrokeSound();
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const hasText = messageInput.trim().length > 0;
    // `isSending` should come from your store; fall back gracefully if absent.
    const isPending = false;

    return (
        <div
            className="p-2 flex justify-between w-full items-center gap-2"
            role="region"
            aria-label={
                activeChatUser
                    ? `Message input for ${activeChatUser}`
                    : 'Message input'
            }
        >
            <AnimatePresence>
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.5 },
                        layout: { type: 'spring', bounce: 0.15 },
                    }}
                    className="w-full relative"
                >
                    {/*
                     * KEY FIX: key={activeChatUser?.id} tells React to
                     * unmount + remount this Textarea whenever the active
                     * chat user changes.  This:
                     *   1. Prevents the "changing uncontrolled to controlled"
                     *      warning.
                     *   2. Resets internal browser state (scroll, cursor).
                     *   3. Ensures the correct draft is shown immediately.
                     */}
                    <Textarea
                        key={activeChatUser ?? 'no-user'}
                        ref={textAreaRef}
                        autoComplete="off"
                        placeholder="Aa"
                        rows={1}
                        className="w-full border rounded-full flex items-center h-9 resize-none overflow-hidden
                            bg-background min-h-0"
                        value={messageInput}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        disabled={!activeChatUser || isPending}
                        aria-label={
                            activeChatUser
                                ? `Type a message to ${activeChatUser}`
                                : 'Select a conversation to start typing'
                        }
                        aria-multiline="true"
                        aria-disabled={!activeChatUser || isPending}
                    />

                    <div className="absolute right-2 bottom-0.5">
                        <EmojiPicker
                            onChange={(emoji) => {
                                if (!activeChatUser) return;
                                setDraft(activeChatUser, messageInput + emoji);
                                textAreaRef.current?.focus();
                            }}
                        />
                    </div>
                </motion.div>

                {hasText ? (
                    <Button
                        key="send-btn"
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant="ghost"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={isPending || !activeChatUser}
                        aria-label="Send message"
                    >
                        {isPending ? (
                            <Loader
                                size={20}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <SendHorizontal
                                size={20}
                                className="text-muted-foreground"
                                aria-hidden="true"
                            />
                        )}
                    </Button>
                ) : (
                    <Button
                        key="like-btn"
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant="ghost"
                        size="icon"
                        onClick={handleLikeClick}
                        disabled={isPending || !activeChatUser}
                        aria-label="Send a thumbs up reaction"
                    >
                        {isPending ? (
                            <Loader
                                size={20}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <ThumbsUp
                                size={20}
                                className="text-muted-foreground"
                                aria-hidden="true"
                            />
                        )}
                    </Button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ChatBottomBar;
