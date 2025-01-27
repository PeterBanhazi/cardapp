import React from 'react';

import ChatLayout from '../chatapp/components/chat/ChatLayout';
import Cookies from 'js-cookie';
import { USERS } from '../chatapp/db/dummy';

const ChatLobby = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;
    return (
        <div className="z-10 border rounded-lg max-w-full w-full h-[60vh] text-sm lg:flex">
            <ChatLayout defaultLayout={defaultLayout} users={USERS} />
        </div>
    );
};

export default ChatLobby;
