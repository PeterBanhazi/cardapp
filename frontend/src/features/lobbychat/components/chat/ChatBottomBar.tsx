import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, SendHorizontal, ThumbsUp } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import EmojiPicker from './EmojiPicker';
import { usePreferences } from '../../store/usePreferences';
import useSound from 'use-sound';

import { useChatStore } from '../../../../store/useChatStore';

function ChatBottomBar() {
    const [messageInput, setMessageInput] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const { soundEnabled } = usePreferences();

    const { activeChatUser, sendChatMessage } = useChatStore();

    const [playSound1] = useSound('/sounds/keystroke1.mp3');
    const [playSound2] = useSound('/sounds/keystroke2.mp3');
    const [playSound3] = useSound('/sounds/keystroke3.mp3');
    const [playSound4] = useSound('/sounds/keystroke4.mp3');
    const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4];

    const playRandomKeyStrokeSound = () => {
        const randomIndex = Math.floor(
            Math.random() * playSoundFunctions.length
        );
        soundEnabled && playSoundFunctions[randomIndex]();
    };

    const [isPending, sendingMessage] = useState(false);

    const handleSendMessage = () => {
        if (messageInput.trim() && activeChatUser) {
            sendChatMessage(activeChatUser, messageInput.trim());
            setMessageInput('');
        }

        textAreaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setMessageInput(messageInput + '\n');
        }
    };

    return (
        <div className="p-2 flex justify-between w-full items-center gap-2">
            <AnimatePresence>
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.5 },
                        layout: {
                            type: 'spring',
                            bounce: 0.15,
                        },
                    }}
                    className="w-full relative"
                >
                    <Textarea
                        autoComplete="off"
                        placeholder="Aa"
                        rows={1}
                        className="w-full border rounded-full flex items-center h-9 resize-none overflow-hidden
						bg-background min-h-0"
                        value={messageInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setMessageInput(e.target.value);

                            playRandomKeyStrokeSound();
                        }}
                        ref={textAreaRef}
                    />
                    <div className="absolute right-2 bottom-0.5">
                        <EmojiPicker
                            onChange={(emoji) => {
                                setMessageInput(messageInput + emoji);
                                if (textAreaRef.current) {
                                    textAreaRef.current.focus();
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {messageInput.trim() ? (
                    <Button
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant={'ghost'}
                        size={'icon'}
                        onClick={handleSendMessage}
                    >
                        <SendHorizontal
                            size={20}
                            className="text-muted-foreground"
                        />
                    </Button>
                ) : (
                    <Button
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant={'ghost'}
                        size={'icon'}
                    >
                        {!isPending && (
                            <ThumbsUp
                                size={20}
                                className="text-muted-foreground"
                                onClick={() => {
                                    handleSendMessage;
                                }}
                            />
                        )}

                        {isPending && (
                            <Loader size={20} className="animate-spin" />
                        )}
                    </Button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ChatBottomBar;
