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

import { useEffect, useMemo } from 'react';
import { useFriendsStore } from '../../../core/store/useFriendsStore';
import { useChatStore } from '../../../core/store/useChatStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useFriendList } from '../../../core/store/useFriendList';
import { Friend } from '@/shared/types/friend';
import { UsernameWrapper } from '@/shared/components/ui/UsernameWrapper';
import { useFriendListWithStatus } from './useFriendListWithStatus';
import { FriendDisplayUser } from '@/shared/types/friendTypes';
import { FriendWithStatus } from './useFriendListWithStatus';
interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const [playClickSound] = useSound('/sounds/mouse-click.mp3');
    const { soundEnabled } = usePreferences();
    const { setSelectedUser } = useSelectedUser();

    const { friends, isConnected, setFriendStatus, sendAction } =
        useFriendsStore();
    const { activeChatUser, setActiveChatUser, openChat, getUnreadCount } =
        useChatStore();

    const loggedInUsername =
        useAuthStore((state) => state.user?.username) ?? '';

    // ── Populate friends from REST on mount ───────────────────────────────────

    const friendList = useFriendListWithStatus();
    console.log(friendList);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const handleSideBarFriendClick = (friendClicked: FriendWithStatus) => {
        if (friendClicked.status === 'active') {
            openChat(friendClicked.friend.username);
        }
        setSelectedUser(friendClicked.friend);
        setActiveChatUser(friendClicked.friend.username);
    };

    const getAvatarRingConfig = (ringStatus: FriendWithStatus['status']) => {
        switch (ringStatus) {
            case 'online':
                return { styles: 'ring-2 ring-blue-500 ring-inset' };
            case 'offline':
                return { styles: '' };
            case 'pending':
                return { styles: 'ring-2 ring-yellow-500 ring-inset' };
            case 'active':
                return { styles: 'ring-2 ring-green-400 ring-inset' };
            case 'closed':
                return { styles: 'ring-3 ring-grey-300 ring-inset' };
            case 'rejected':
                return { styles: 'ring-2 ring-red-400 ring-inset' };
            case 'cancelled':
                return { styles: 'ring-2 ring-red-300 ring-inset' };
            default:
                return { styles: 'ring-2 ring-blue-400 ring-inset' };
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="group relative min-w-min flex flex-col h-full gap-1 p-1 data-[collapsed=true]:p-2 max-h-full overflow-auto bg-background">
            <div className="flex justify-between p-1 items-center">
                <div className="flex gap-2 items-center text-2xl">
                    <p className="font-semibold text-slate-800">Friends</p>
                </div>
            </div>

            {friendList.length === 0 ? (
                <div className="p-4 text-center text-gray-800">
                    {isConnected ? 'No friends online' : 'Connecting...'}
                </div>
            ) : (
                <ScrollArea className="gap-2 px-2 max-w-min group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                    {friendList.map((friendListItem) =>
                        isCollapsed ? (
                            // ── Collapsed: avatar + tooltip only ──────────────
                            <TooltipProvider key={friendListItem.friend_req_id}>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => {
                                                soundEnabled &&
                                                    playClickSound();
                                                handleSideBarFriendClick(
                                                    friendListItem
                                                );
                                            }}
                                        >
                                            <Avatar className="my-2 flex justify-center items-center">
                                                <AvatarImage
                                                    src={'/avatars/user3.png'}
                                                    alt="User Image"
                                                    className={cn(
                                                        'flex justify-center items-center p-0.5 border-white rounded-full w-10 h-10',
                                                        getAvatarRingConfig(
                                                            friendListItem.status
                                                        ).styles
                                                    )}
                                                />
                                                <AvatarFallback>
                                                    {
                                                        friendListItem.friend
                                                            .username
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="flex items-center  bg-slate-200/40 ring ring-slate-800/30"
                                    >
                                        {friendListItem.friend.username}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            // -----------------Expanded
                            <Button
                                key={friendListItem.created_at}
                                variant={'grey'}
                                size="lg"
                                className={cn(
                                    'w-[220px] px-1 gap-1 justify-start my-1 text-slate-800 bg-slate-200/20',
                                    activeChatUser ===
                                        friendListItem.friend.username &&
                                        'bg-slate-50/50 hover:bg-muted hover:text-white shrink'
                                )}
                                onClick={() => {
                                    soundEnabled && playClickSound();
                                    handleSideBarFriendClick(friendListItem);
                                }}
                            >
                                {/* Avatar */}
                                <Avatar
                                    className={cn(
                                        'flex justify-center p-0.5 items-center',
                                        getAvatarRingConfig(
                                            friendListItem.status
                                        ).styles
                                    )}
                                >
                                    <AvatarImage
                                        src={'/avatars/user3.png'}
                                        alt={'User image'}
                                    />
                                    <AvatarFallback>
                                        {friendListItem.friend.username}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Name + unread badge */}
                                <div className="flex flex-col text-lg flex-1 min-w-0">
                                    <span className="text-left truncate">
                                        {friendListItem.friend.username} {':'}
                                        {friendListItem.status}
                                        {getUnreadCount(
                                            friendListItem.friend.username
                                        ) > 0 && (
                                            <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                                {getUnreadCount(
                                                    friendListItem.friend
                                                        .username
                                                )}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* ChatActionButton — stopPropagation so Accept/Reject
                                    don't also trigger the row's setSelectedUser */}
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-auto shrink-0"
                                ></div>
                            </Button>
                        )
                    )}
                </ScrollArea>
            )}

            {/* Footer */}
            <div className="mt-auto" />
            <div className="flex justify-between items-center gap-2 md:px-2 py-2">
                {!isCollapsed && (
                    <div className="hidden md:flex gap-2 items-center">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                        </div>
                        <Avatar className="flex justify-center items-center">
                            <AvatarImage
                                src={'/user-placeholder.png'}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 border-2 border-white rounded-full"
                            />
                        </Avatar>
                        <span className="font-bold text-sm">
                            <UsernameWrapper
                                options={{
                                    maxWidth: 120,
                                    tooltipIsActive: true,
                                    tooltipTheme: 'light',
                                    isClickable: false,
                                }}
                                username={loggedInUsername}
                            />
                        </span>
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
