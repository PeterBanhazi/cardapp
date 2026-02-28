import React from 'react';
import { USERS } from '../../db/dummy';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Info, X } from 'lucide-react';
import { useSelectedUser } from '../../store/useSelectedUser';
import PreferencesTab from '../PreferencesTab';
import { useChatStore } from '../../../../store/useChatStore';

const ChatTopBar = () => {
    const { activeChatUser, closeChat, setActiveChatUser } = useChatStore();
    return (
        <div className="w-full h-20 flex p-4 justify-between items-center border-b">
            <div className="flex items-center gap-2">
                {activeChatUser && (
                    <Avatar className="flex justify-center items-center">
                        <AvatarImage
                            src={'/user-placeholder.png'}
                            alt="User Image"
                            className="w-10 h-10 object-cover rounded-full"
                        />
                    </Avatar>
                )}
                <span className="font-medium">{activeChatUser}</span>
            </div>
            <div className="flex gap-2">
                <PreferencesTab />
                <Info className="text-muted-foreground cursor-pointer hover:text-primary" />
                <X
                    className="text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => setActiveChatUser(null)}
                />
            </div>
        </div>
    );
};

export default ChatTopBar;
