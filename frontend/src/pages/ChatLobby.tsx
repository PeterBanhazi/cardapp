import React from 'react';

import ChatLayout from '../chatapp/components/chat/ChatLayout';
import Cookies from 'js-cookie';
import { USERS } from '../chatapp/db/dummy';
// import StatusList from './wstest/useStatusList';
// import ChatApp from './wstest/ChatApp';
import WsStatusTest from './wstest/WsStatusTest';
import ChatWindow from './wsFriendStatus/ChatWindow';
import { WebSocketStatusManager } from '../store/useFriendsStore';
import {
    ConnectionStatus,
    FriendsList,
    DebugPanel,
} from './wsFriendStatus/wsFriendStatus';
import { useChatStore, ChatWebSocketManager } from '../store/useChatStore';

const ChatLobby = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;

    return (
        <div className="z-10 border rounded-lg max-w-full w-full h-[880px] text-sm lg:flex-row">
            {/* <ChatWebSocketManager friendUser={activeChatUser} /> */}
            <div className="max-h-[400px] w-full lg:flex">
                <ChatWindow />
                <FriendsList />
                <DebugPanel />
            </div>
            {/* <ConnectionStatus /> */}

            {/* <StatusList /> */}
            {/* <ChatWindow /> */}
            <div className="h-[500px]">
                <ChatLayout defaultLayout={defaultLayout} users={USERS} />
            </div>
        </div>
    );
};

export default ChatLobby;
