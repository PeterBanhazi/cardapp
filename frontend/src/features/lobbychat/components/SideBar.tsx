import { User } from '../db/dummy';
import { ScrollArea } from './ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { cn } from '../../../lib/utils';
import { LogOut } from 'lucide-react';
import useSound from 'use-sound';
import { usePreferences } from '../store/usePreferences';
import { useSelectedUser } from '../store/useSelectedUser';

import { useState, useEffect, useMemo } from 'react';
import { useFriendsStore } from '../../../core/store/useFriendsStore';
import { useChatStore } from '../../../core/store/useChatStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import {
    RequestButton,
    StatusBadge,
} from '../../../core/wsFriendStatus/wsFriendStatus';
interface SidebarProps {
    isCollapsed: boolean;
}

interface Friend {
    user: string;
    status: 'online' | 'offline' | 'request' | 'closed' | 'accepted';
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const [playClickSound] = useSound('/sounds/mouse-click.mp3');
    const { soundEnabled } = usePreferences();
    const { setSelectedUser, selectedUser } = useSelectedUser();

    const { friends, isConnected, acceptChatRequest } = useFriendsStore();
    const { openChat, getUnreadCount } = useChatStore();
    const { activeChatUser, setActiveChatUser } = useChatStore();
    const loggedInUsername = useAuthStore.getState().user?.username;
    const friendsLista = Object.values(friends);

    const friendsList = useMemo(() => {
        // Create a map to store the latest status for each user
        const userStatusMap = new Map<
            string,
            'request' | 'accepted' | 'online' | 'closed' | 'offline'
        >();
        // Process all status messages to get the latest status for each user

        friendsLista.forEach((friend) => {
            userStatusMap.set(
                friend.user,
                friend.status as 'online' | 'offline'
            );
        });

        // Convert map to array and filter out logged-in user
        return Array.from(userStatusMap.entries())
            .filter(([username]) => username !== loggedInUsername)
            .map(([user, status]) => ({ user, status }));
    }, [friends, loggedInUsername]);

    const handleFriendClick = (friend: Friend) => {
        if (friend.status === 'request') {
            console.log(friend.user);
            // Accept the chat request
            openChat(friend.user);
            acceptChatRequest(friend.user);
        } else if (friend.status === 'accepted' || friend.status === 'online') {
            // Open existing chat
            openChat(friend.user);
            setActiveChatUser(friend.user);
            console.log('autoopen: ' + friend.user);
        }
    };

    return (
        <div className="group relative flex flex-col h-full gap-1 p-1 data-[collapsed=true]:p-2  max-h-full overflow-auto bg-background">
            <div className="flex justify-between p-1 items-center">
                <div className="flex gap-2 items-center text-2xl">
                    <p className="font-semibold text-slate-800">Friends</p>
                </div>
            </div>
            {friendsList.length === 0 ? (
                <div className="p-4 text-center text-gray-800">
                    {isConnected ? 'No friends online' : 'Connecting...'}
                </div>
            ) : (
                <ScrollArea className="gap-2 px-2 group-[[data - collapsed= true]]:justify-center group-[[data-collapsed=true]]:px-2">
                    {friendsList.map((friend, idx) =>
                        isCollapsed ? (
                            <TooltipProvider key={idx}>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => {
                                                soundEnabled &&
                                                    playClickSound();
                                                handleFriendClick(friend);
                                                setSelectedUser(friend);
                                            }}
                                        >
                                            <Avatar className="my-3 flex justify-center items-center">
                                                <AvatarImage
                                                    src={'/avatars/user4.png'}
                                                    alt="User Image"
                                                    className={cn(
                                                        'flex justify-center items-center border-2 border-white rounded-full w-10 h-10',
                                                        friend.status ===
                                                            'online' &&
                                                            friend.status ===
                                                                'online' &&
                                                            'border-3 border-green-400'
                                                    )}
                                                />
                                                <AvatarFallback>
                                                    {friend.user}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="sr-only">
                                                {friend.user}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="flex items-center gap-4 bg-slate-200/40 ring ring-slate-800/30"
                                    >
                                        {friend.user}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Button
                                key={idx}
                                variant={'grey'}
                                size="lg"
                                className={cn(
                                    'w-[240px] px-1 gap-1 justify-start my-1 text-slate-800 bg-slate-200/20',
                                    activeChatUser === friend.user &&
                                        'bg-slate-50/50  hover:bg-muted hover:text-white shrink'
                                )}
                                onClick={() => {
                                    soundEnabled && playClickSound();
                                    handleFriendClick(friend);
                                    setSelectedUser(friend);
                                }}
                            >
                                <Avatar
                                    className={cn(
                                        'flex justify-center p-0.5 items-center',
                                        friend.status === 'online' &&
                                            'ring-2 ring-green-400 ring-inset'
                                    )}
                                >
                                    <AvatarImage
                                        src={'/avatars/user3.png'}
                                        alt={'User image'}
                                    />
                                    <AvatarFallback>
                                        {friend.user}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col  text-lg w-48 ">
                                    <span className="text-left">
                                        {friend.user}

                                        {getUnreadCount(friend.user) > 0 && (
                                            <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                                {getUnreadCount(friend.user)}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </Button>
                        )
                    )}
                </ScrollArea>
            )}
            <div className="mt-auto"></div>
            <div className="flex justify-between items-center gap-2 md:px-6 py-2">
                {!isCollapsed && (
                    <div className="hidden md:flex gap-2 items-center ">
                        <Avatar className="flex justify-center items-center">
                            <AvatarImage
                                src={'/user-placeholder.png'}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 border-2 border-white rounded-full"
                            />
                        </Avatar>
                        <p className="font-bold text-lg">{loggedInUsername}</p>
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                        </div>
                    </div>
                )}
                <div className="flex">
                    <LogOut size={22} cursor={'pointer'} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
