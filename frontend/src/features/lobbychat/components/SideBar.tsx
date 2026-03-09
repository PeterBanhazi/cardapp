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
import { Friend } from '@/shared/types/friend';
interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const [playClickSound] = useSound('/sounds/mouse-click.mp3');
    const { soundEnabled } = usePreferences();
    const { setSelectedUser, selectedUser } = useSelectedUser();

    const { friends, isConnected, sendAcceptChatRequest } = useFriendsStore();
    const { openChat, getUnreadCount } = useChatStore();
    const { activeChatUser, setActiveChatUser } = useChatStore();
    const loggedInUsername = useAuthStore((state) => state.user?.username);

    const statusPriority: Record<Friend['status'], number> = {
        active: 0,
        pending: 1,
        rejected: 2,
        cancelled: 3,
        online: 4,
        closed: 5,
        offline: 6,
    };
    const friendsList = useMemo(() => {
        const userStatusMap = new Map<string, Friend['status']>();

        Object.values(friends).forEach((friend) => {
            userStatusMap.set(friend.user, friend.status);
        });

        return Array.from(userStatusMap.entries())
            .filter(([username]) => username !== loggedInUsername)
            .map(([user, status]) => ({ user, status }))
            .sort(
                (a, b) => statusPriority[a.status] - statusPriority[b.status]
            );
    }, [friends, loggedInUsername]);

    const handleSideBarFriendClick = (friend: Friend) => {
        // if (friend.status === 'pending') {
        // Accept the chat request
        setSelectedUser(friend);
        // sendAcceptChatRequest(friend.user);
        // }
        //      else if
        // (friend.status === 'active' || friend.status === 'online') {
        //         // Open existing chat
        //         setSelectedUser(friend);
        //         // setActiveChatUser(friend.user);
        //     }
    };

    const getAvatarRingConfig = (ringStatus: Friend['status']) => {
        switch (ringStatus) {
            case 'online':
                return {
                    text: 'Chat',
                    styles: 'ring-2 ring-blue-500 ring-inset',
                    disabled: false,
                };
            case 'offline':
                return {
                    text: 'Offline',
                    styles: '',
                    disabled: true,
                };
            case 'pending':
                return {
                    text: 'Pending',
                    styles: 'ring-2 ring-yellow-500 ring-inset',
                    disabled: false,
                };
            case 'active':
                return {
                    text: 'Active',
                    styles: 'ring-2 ring-green-400 ring-inset',
                    disabled: true,
                };
            case 'closed':
                return {
                    text: 'Reconnect',
                    styles: 'ring-3 ring-grey-300 ring-inset',
                    disabled: false,
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    styles: 'ring-2 ring-red-400 ring-inset',
                    disabled: true,
                };
            case 'cancelled':
                return {
                    text: 'Cancelled',
                    styles: 'ring-2 ring-red-300 ring-inset',
                    disabled: false,
                };
            default:
                return {
                    text: 'Chat',
                    styles: 'ring-2 ring-blue-400 ring-inset',
                    disabled: true,
                };
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
                                                handleSideBarFriendClick(
                                                    friend
                                                );
                                                setSelectedUser(friend);
                                            }}
                                        >
                                            <Avatar className="my-3 flex justify-center items-center">
                                                <AvatarImage
                                                    src={'/avatars/user3.png'}
                                                    alt="User Image"
                                                    className={cn(
                                                        `flex justify-center items-center p-0.5  border-white rounded-full w-10 h-10`,
                                                        `${getAvatarRingConfig(friend.status).styles}`
                                                    )}
                                                />
                                                <AvatarFallback>
                                                    {friend.user}
                                                </AvatarFallback>
                                            </Avatar>
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
                                    handleSideBarFriendClick(friend);
                                    setSelectedUser(friend);
                                }}
                            >
                                <Avatar
                                    className={cn(
                                        `flex justify-center p-0.5 items-center`,
                                        `${getAvatarRingConfig(friend.status).styles}`
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
                                        {':'}
                                        {friend.status}

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
