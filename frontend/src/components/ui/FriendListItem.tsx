import React, { useEffect, useRef, useState } from 'react';
import {
    MoreVertical,
    MessageSquare,
    GamepadIcon,
    Trash2,
    Info,
    Check,
    X,
} from 'lucide-react';

import { Friendship } from '../../utils/types';

// interface FriendListItemProps {
//     friendship: Friendship;
//     onAccept?: (username: string) => void;
//     onDecline?: (username: string) => void;
//     onDelete?: (username: string) => void;
//     onChat?: (username: string) => void;
//     onPlay?: (username: string) => void;
//     onInfo?: (username: string) => void;
// }

const FriendListItem: React.FC<{
    friendship: Friendship;
}> = ({ friendship }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const colors = {
        red: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200 ring-opacity-30',
        green: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200 ring-opacity-30',
        yellow: 'from-amber-400 to-amber-600 hover:from-yellow-500 hover:to-orange-300 hover:ring-1 ring-inset ring-slate-200 ring-opacity-30',
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative">
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-2 mt-2 w-35 bg-white rounded-md shadow-lg z-10 border"
                >
                    <div className="py-1">
                        {friendship.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onAccept?.(
                                                friendship.friend_username
                                            )
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Accept
                                </button>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onDecline?.(
                                                friendship.friend_username
                                            )
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                >
                                    <X className="w-4 h-4 mr-2" /> Decline
                                </button>
                            </>
                        )}

                        {friendship.status === 'ACCEPTED' && (
                            <>
                                <button
                                    onClick={() =>
                                        handleAction(() =>
                                            onChat?.(friendship.friend_username)
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
                                            onPlay?.(friendship.friend_username)
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
                                            onDelete?.(
                                                friendship.friend_username
                                            )
                                        )
                                    }
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </button>
                            </>
                        )}

                        <button
                            onClick={() =>
                                handleAction(() =>
                                    onInfo?.(friendship.friend_username)
                                )
                            }
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                            <Info className="w-4 h-4 mr-2" /> Info
                        </button>
                    </div>
                </div>
            )}
            <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                ref={buttonRef}
                className={`relative
                      
                
                text-slate-900               
                font-semibold 
                text-sm
                border
                rounded-md
                transition-all 
                duration-300
                bg-gradient-to-br
                ${
                    friendship.status === `PENDING`
                        ? colors.yellow
                        : friendship.status === 'ACCEPTED'
                        ? colors.green
                        : colors.red
                }
               
                border-slate-400/50
                active:translate-y-0.5
                overflow-hidden
                `}
            >
                <span
                    className="
                absolute 
                inset-0 
                border-1
               
                bg-gradient-to-b 
                from-white/30 
                to-transparent
                rounded-md
                cursor-pointer
                "
                />
                <div className="px-1 mr-1 overflow-hidden">
                    {' '}
                    {friendship.friend_username}
                </div>
            </div>
        </div>
    );
};

export default FriendListItem;
