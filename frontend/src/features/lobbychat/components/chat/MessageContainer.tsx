import { useEffect } from 'react';
import ChatTopBar from './ChatTopBar';
import MessageList from './MessageList';
import ChatBottomBar from './ChatBottomBar';
import { useChatStore } from '@/core/store/useChatStore';

/**
 * MessageContainer
 *
 * Wraps the full conversation view: top bar, scrollable message list,
 * and the bottom input bar.
 *
 * Accessibility:
 * - role="main" marks this as the primary content landmark.
 * - The inner scroll region is a log (live region) so screen readers
 *   announce new messages automatically.
 * - Escape key clears the active chat user (preserved from original).
 */
const MessageContainer = () => {
    const { activeChatUser, setActiveChatUser } = useChatStore();

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveChatUser(null);
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);

        // Re-register only when the setter reference changes (stable in Zustand).
    }, [setActiveChatUser]);

    return (
        <main
            className="flex flex-col justify-between w-full h-full"
            aria-label={
                activeChatUser
                    ? `Conversation with ${activeChatUser}`
                    : 'No conversation selected'
            }
        >
            <ChatTopBar />

            {/*
             * role="log" + aria-live="polite":
             * Screen readers will announce new messages as they arrive
             * without interrupting the user mid-sentence.
             */}
            <div
                className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
                role="log"
                aria-live="polite"
                aria-label="Messages"
                aria-relevant="additions"
            >
                <MessageList />
                <ChatBottomBar />
            </div>
        </main>
    );
};

export default MessageContainer;
