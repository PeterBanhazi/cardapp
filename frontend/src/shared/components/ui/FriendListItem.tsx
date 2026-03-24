import React, { useEffect, useRef, useState } from 'react';
import {
    MessageSquare,
    GamepadIcon,
    Trash2,
    Info,
    Check,
    X,
    Send,
} from 'lucide-react';
import { FriendListItemData } from '@/features/options/friendTypes';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const colors = {
        red: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200/30',
        green: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200/30',
        yellow: 'from-amber-400 to-amber-600 hover:from-yellow-500 hover:to-orange-300 hover:ring-1 ring-inset ring-slate-200/30',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsDropdownOpen(false);
    };

    const { friend, status, source, friend_req_id } = friendship;

    return (
        <div className="relative">
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-5 mt-2 w-28 bg-white rounded-md z-10 border shadow-sm"
                >
                    <div className="py-1">
                        {/* ── Received pending: only receiver may accept/decline ── */}
                        {status === 'pending' && source === 'received' && (
                            <>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onAccept?.(friend_req_id)
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Accept
                                </button>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onDecline?.(friend_req_id)
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                >
                                    <X className="w-4 h-4 mr-2" /> Decline
                                </button>
                            </>
                        )}

                        {/* ── Sent pending: only initiator may cancel ── */}
                        {status === 'pending' && source === 'sent' && (
                            <button
                                onClick={() =>
                                    handleAction(() =>
                                        onCancel?.(friend_req_id)
                                    )
                                }
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </button>
                        )}

                        {/* ── Accepted friend ── */}
                        {status === 'accepted' && (
                            <>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onChat?.(friend.username)
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />{' '}
                                    Chat
                                </button>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onPlay?.(friend.username)
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                >
                                    <GamepadIcon className="w-4 h-4 mr-2" />{' '}
                                    Play
                                </button>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onDelete?.(friend_req_id)
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </button>
                            </>
                        )}

                        {/* ── Info always available ── */}
                        <button
                            onClick={() =>
                                handleAction(() => onInfo?.(friend.username))
                            }
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                            <Info className="w-4 h-4 mr-2" /> Info
                        </button>
                    </div>
                </div>
            )}

            <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                ref={buttonRef}
                className={`relative
                    text-slate-900
                    font-semibold
                    text-sm
                    rounded-md
                    transition-all
                    duration-300
                    bg-gradient-to-br
                    ${
                        status === 'pending'
                            ? colors.yellow
                            : status === 'accepted'
                              ? colors.green
                              : colors.red
                    }
                    border-slate-400/50
                    active:translate-y-[2px]
                `}
            >
                <span
                    className="
                        absolute inset-0
                        ring-1 ring-slate-800
                        bg-gradient-to-b from-white/30 to-transparent
                        rounded-md cursor-pointer
                    "
                />
                <div className="pl-1 mr-0.5 overflow-hidden flex items-center gap-1">
                    {/* Small directional hint for pending requests */}
                    {status === 'pending' && source === 'sent' && (
                        <Send className="w-3 h-3 shrink-0 opacity-70" />
                    )}
                    {friend.username}
                </div>
            </div>
        </div>
    );
};

export default FriendListItem;
