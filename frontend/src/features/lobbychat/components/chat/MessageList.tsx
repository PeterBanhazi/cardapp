import { Avatar, AvatarImage } from '../ui/avatar';
import { Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { messages, USERS } from '../../db/dummy';
import { useSelectedUser } from '../../store/useSelectedUser';
import MessageSkeleton from '../skeletons/MessageSkeleton';
import { useChatStore } from '../../../../store/useChatStore';
import { useAuthStore } from '../../../../store/useAuthStore';

const MessageList = () => {
    // added by me
    // const currentUser = {
    //     id: 'randId',
    //     email: 'kamu@reg.hz',
    //     given_name: 'Peter',
    //     family_name: 'legjobb',
    //     picture: '/avatars/user4.png',
    // };

    const { activeChatUser, chatConnections, markMessagesAsRead } =
        useChatStore();
    const loggedInUsername = useAuthStore.getState().user?.username;
    const activeChat = activeChatUser ? chatConnections[activeChatUser] : null;

    useEffect(() => {
        if (activeChatUser) {
            markMessagesAsRead(activeChatUser);
        }
    }, [activeChatUser, markMessagesAsRead]);

    const isUserLoading = false;
    const isMessagesLoading = false;

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
        }
    }, [activeChat]);

    return (
        <div
            ref={messageContainerRef}
            className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
        >
            {/* This component ensure that an animation is applied when items are added to or removed from the list */}
            <AnimatePresence>
                {activeChat &&
                    !isMessagesLoading &&
                    activeChat.messages.map((message, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                            transition={{
                                opacity: { duration: 0.1 },
                                layout: {
                                    type: 'spring',
                                    bounce: 0.3,
                                    duration:
                                        activeChat.messages.indexOf(message) *
                                            0.05 +
                                        0.2,
                                },
                            }}
                            style={{
                                originX: 0.5,
                                originY: 0.5,
                            }}
                            className={cn(
                                'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                                message.sender === loggedInUsername
                                    ? 'items-end'
                                    : 'items-start'
                            )}
                        >
                            <div className="flex gap-3 items-center">
                                {message.sender === activeChatUser && (
                                    <Avatar className="flex justify-center items-center">
                                        <AvatarImage
                                            src="/avatars/user4.png"
                                            alt="User Image"
                                            className="border-2 border-white rounded-full"
                                        />
                                    </Avatar>
                                )}

                                <span className="bg-accent p-3 rounded-md max-w-xs">
                                    {message.message}
                                </span>

                                {message.sender === loggedInUsername && (
                                    <Avatar className="flex justify-center items-center">
                                        <AvatarImage
                                            src={'/user-placeholder.png'}
                                            alt="User Image"
                                            className="border-2 border-white rounded-full"
                                        />
                                    </Avatar>
                                )}
                            </div>
                        </motion.div>
                    ))}

                {isMessagesLoading && (
                    <>
                        <MessageSkeleton />
                        <MessageSkeleton />
                        <MessageSkeleton />
                        <MessageSkeleton />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MessageList;
