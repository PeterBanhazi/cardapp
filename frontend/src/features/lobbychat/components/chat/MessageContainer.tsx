import { useEffect } from 'react';
import ChatTopBar from './ChatTopBar';
import MessageList from './MessageList';
import ChatBottomBar from './ChatBottomBar';
import { useChatStore } from '../../../../store/useChatStore';

const MessageContainer = () => {
    const { activeChatUser, setActiveChatUser } = useChatStore();
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveChatUser(null);
        };

        document.addEventListener('keydown', handleEscape);

        return () => document.removeEventListener('keydown', handleEscape);
    }, [activeChatUser]);
    return (
        <div className="flex flex-col justify-between w-full h-full">
            <ChatTopBar />

            <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
                <MessageList />
                <ChatBottomBar />
            </div>
        </div>
    );
};

export default MessageContainer;
