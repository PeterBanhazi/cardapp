import React from 'react';

import ChatLayout from '../chatapp/components/chat/ChatLayout';
import Cookies from 'js-cookie';
import { USERS } from '../chatapp/db/dummy';

const JustAContainer = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;
    return (
        <div className="w-screen h-[950px] border-2 border-blue-300 bg-gray-500">
            <div className="flex h-screen flex-col items-center justify-center p-4 md:px-24 py-12 gap-4">
                <div className="z-10 border rounded-lg max-w-5xl w-full min-h-[85vh] text-sm lg:flex">
                    <ChatLayout defaultLayout={defaultLayout} users={USERS} />
                </div>
            </div>
        </div>
    );
};

export default JustAContainer;
