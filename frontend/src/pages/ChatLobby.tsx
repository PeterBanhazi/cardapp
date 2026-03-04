import React from 'react';

import ChatLayout from '../features/lobbychat/components/chat/ChatLayout';
import Cookies from 'js-cookie';

const ChatLobby = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;

    return (
        <div className="z-10 rounded-lg max-w-full w-full h-[500px] text-sm lg:flex-row">
            {/* <ChatWebSocketManager friendUser={activeChatUser} /> */}
            <div className="max-h-[400px] w-full lg:flex">
                {/* <ChatWindow />
                <FriendsList />
                <DebugPanel /> */}
            </div>
            {/* <ConnectionStatus /> */}

            {/* <StatusList /> */}
            {/* <ChatWindow /> */}
            <div className="h-[500px]">
                <ChatLayout defaultLayout={defaultLayout} />
            </div>
        </div>
    );
};

export default ChatLobby;
