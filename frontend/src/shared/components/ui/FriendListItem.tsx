import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    MessageSquare,
    GamepadIcon,
    Trash2,
    Info,
    Check,
    X,
    Send,
} from 'lucide-react';
import { FriendListItemData } from '@/shared/types/friendTypes';
import { UsernameWrapper } from './UsernameWrapper';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FriendListItemProps {
    friendship: FriendListItemData;
    /** Received pending request: accept it */
    onAccept?: (friendReqId: number) => void;
    /** Received pending request: decline it */
    onDecline?: (friendReqId: number) => void;
    /** Sent pending request: cancel it */
    onCancel?: (friendReqId: number) => void;
    /** Accepted friend: remove friendship */
    onDelete?: (friendReqId: number) => void;
    onChat?: (username: string) => void;
    onPlay?: (username: string) => void;
    onInfo?: (username: string) => void;
}

// ---------------------------------------------------------------------------
// Shared item class helpers
// ---------------------------------------------------------------------------

const menuItemBase =
    'flex items-center px-4 py-2 text-sm w-full cursor-pointer select-none outline-none rounded-sm transition-colors duration-100';

const menuItemGray = `${menuItemBase} text-gray-700 hover:bg-gray-100 focus:bg-gray-100`;

const menuItemGreen = `${menuItemBase} text-green-600 hover:bg-gray-100 focus:bg-gray-100`;

const menuItemRed = `${menuItemBase} text-red-600 hover:bg-gray-100 focus:bg-gray-100`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FriendListItem: React.FC<FriendListItemProps> = ({
    friendship,
    onAccept,
    onDecline,
    onCancel,
    onDelete,
    onChat,
    onPlay,
    onInfo,
}) => {
    const colors = {
        red: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200/30',
        green: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200/30',
        yellow: 'from-amber-400 to-amber-600 hover:from-yellow-500 hover:to-orange-300 hover:ring-1 ring-inset ring-slate-200/30',
    };

    const { friend, status, source, friend_req_id } = friendship;

    const colorClass =
        status === 'pending'
            ? colors.yellow
            : status === 'accepted'
              ? colors.green
              : colors.red;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <div
                    className={`
                        relative
                        text-slate-900
                        font-semibold
                        text-sm
                        rounded-md
                        transition-all
                        duration-300
                        bg-gradient-to-br
                        ${colorClass}
                        border-slate-400/50
                        active:translate-y-[2px]
                        cursor-pointer
                        select-none
                        outline-none
                    `}
                >
                    <span
                        className="
                            absolute inset-0
                            ring-1 ring-slate-800
                            bg-gradient-to-b from-white/30 to-transparent
                            rounded-md pointer-events-none
                        "
                    />
                    <div className="pl-1 overflow-hidden flex items-center gap-1">
                        {status === 'pending' && source === 'sent' && (
                            <Send className="w-3 h-3 shrink-0 opacity-70" />
                        )}
                        <UsernameWrapper
                            username={friend.username}
                            options={{
                                maxWidth: source === 'sent' ? 120 : 140,
                                tooltipIsActive: false,
                                tooltipTheme: 'light',
                                isClickable: true,
                            }}
                        />
                    </div>
                </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="
                        z-50 min-w-[7rem] w-28 bg-white rounded-md border shadow-sm py-1
                        animate-in fade-in-0 zoom-in-95
                        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                    "
                >
                    {/* ── Received pending: only receiver may accept/decline ── */}
                    {status === 'pending' && source === 'received' && (
                        <>
                            <DropdownMenu.Item
                                className={menuItemGreen}
                                onSelect={() => onAccept?.(friend_req_id)}
                            >
                                <Check className="w-4 h-4 mr-2" /> Accept
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className={menuItemRed}
                                onSelect={() => onDecline?.(friend_req_id)}
                            >
                                <X className="w-4 h-4 mr-2" /> Decline
                            </DropdownMenu.Item>
                        </>
                    )}

                    {/* ── Sent pending: only initiator may cancel ── */}
                    {status === 'pending' && source === 'sent' && (
                        <DropdownMenu.Item
                            className={menuItemRed}
                            onSelect={() => onCancel?.(friend_req_id)}
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </DropdownMenu.Item>
                    )}

                    {/* ── Accepted friend ── */}
                    {status === 'accepted' && (
                        <>
                            <DropdownMenu.Item
                                className={menuItemGray}
                                onSelect={() => onChat?.(friend.username)}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> Chat
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className={menuItemGray}
                                onSelect={() => onPlay?.(friend.username)}
                            >
                                <GamepadIcon className="w-4 h-4 mr-2" /> Play
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className={menuItemRed}
                                onSelect={() => onDelete?.(friend_req_id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenu.Item>
                        </>
                    )}

                    {/* ── Info always available ── */}
                    <DropdownMenu.Item
                        className={menuItemGray}
                        onSelect={() => onInfo?.(friend.username)}
                    >
                        <Info className="w-4 h-4 mr-2" /> Info
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default FriendListItem;
