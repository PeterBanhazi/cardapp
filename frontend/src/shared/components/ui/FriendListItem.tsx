import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import {
    MessageSquare,
    GamepadIcon,
    Trash2,
    Info,
    Check,
    X,
    Send,
} from 'lucide-react';
import {
    FriendDisplayUser,
    FriendListItemData,
} from '@/shared/types/friendTypes';
import { UsernameWrapper } from './UsernameWrapper';
import { FriendInfoContent } from './FriendInfoContent';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FriendListItemProps {
    friendship: FriendListItemData;
    onAccept?: (friendReqId: number) => void;
    onDecline?: (friendReqId: number) => void;
    onCancel?: (friendReqId: number) => void;
    onDelete?: (friendReqId: number) => void;
    onChat?: (username: string) => void;
    onPlay?: (username: string) => void;
    onInfo?: (username: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const menuItemBase =
    'flex items-center px-4 py-2 text-sm w-full cursor-pointer select-none outline-none rounded-sm transition-colors duration-100';
const menuItemGray = `${menuItemBase} text-gray-700 hover:bg-gray-100 focus:bg-gray-100`;
const menuItemGreen = `${menuItemBase} text-green-600 hover:bg-gray-100 focus:bg-gray-100`;
const menuItemRed = `${menuItemBase} text-red-600 hover:bg-gray-100 focus:bg-gray-100`;

// ---------------------------------------------------------------------------
// Virtual anchor element at cursor position (Radix VirtualElement pattern)
// ---------------------------------------------------------------------------

function makeVirtualElement(x: number, y: number): Element {
    const rect = {
        width: 0,
        height: 0,
        top: y,
        left: x,
        right: x,
        bottom: y,
        x,
        y,
        toJSON: () => ({}),
    };
    return {
        getBoundingClientRect: () => rect,
        // Minimum Element interface properties Radix needs
        nodeType: 1,
        ownerDocument: document,
    } as unknown as Element;
}

// ---------------------------------------------------------------------------
// Main Component
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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    // Stores the virtual anchor element at cursor position
    const virtualAnchorRef = useRef<Element | null>(null);
    // A stable wrapper element we give to Popover.Anchor
    const anchorElRef = useRef<HTMLDivElement>(null);
    // The Info menu item DOM node — used to recompute anchor on resize
    const infoItemRef = useRef<HTMLDivElement | null>(null);
    // Cursor offset relative to Info button rect at click time
    const clickOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const colors = {
        red: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200/30',
        green: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200/30',
        yellow: 'from-amber-400 to-amber-600 hover:from-yellow-500 hover:to-orange-300 hover:ring-1 ring-inset ring-slate-200/30',
    };

    const { friend, status, source, friend_req_id } = friendship;
    const displayUser = friend as unknown as FriendDisplayUser;

    const colorClass =
        status === 'pending'
            ? colors.yellow
            : status === 'accepted'
              ? colors.green
              : colors.red;

    const closePopover = useCallback(() => setPopoverOpen(false), []);

    const closeAll = useCallback(() => {
        setPopoverOpen(false);
        setDropdownOpen(false);
    }, []);

    // Patch the anchor element's getBoundingClientRect to point at cursor
    const updateAnchor = useCallback((x: number, y: number) => {
        if (!anchorElRef.current) return;
        const virtual = makeVirtualElement(x, y);
        virtualAnchorRef.current = virtual;
        anchorElRef.current.getBoundingClientRect =
            virtual.getBoundingClientRect.bind(virtual);
    }, []);

    useEffect(() => {
        if (!anchorElRef.current || !virtualAnchorRef.current) return;
        const virtual = virtualAnchorRef.current;
        anchorElRef.current.getBoundingClientRect =
            virtual.getBoundingClientRect.bind(virtual);
    }, [popoverOpen]);

    // On resize, recompute anchor position relative to the Info button
    useEffect(() => {
        if (!popoverOpen) return;
        const handleResize = () => {
            if (!infoItemRef.current) return;
            const rect = infoItemRef.current.getBoundingClientRect();
            updateAnchor(
                rect.left + clickOffsetRef.current.x,
                rect.top + clickOffsetRef.current.y
            );
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [popoverOpen, updateAnchor]);

    // When popover is open, close everything on any click outside both panels
    useEffect(() => {
        if (!popoverOpen) return;
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            // All Radix portaled content lives in [data-radix-popper-content-wrapper] divs
            const wrappers = document.querySelectorAll(
                '[data-radix-popper-content-wrapper]'
            );
            const insideAny = Array.from(wrappers).some((el) =>
                el.contains(target)
            );
            if (!insideAny) closeAll();
        };
        // Use capture so we run before Radix's own listeners
        document.addEventListener('pointerdown', handlePointerDown, true);
        return () =>
            document.removeEventListener(
                'pointerdown',
                handlePointerDown,
                true
            );
    }, [popoverOpen, closeAll]);

    const handleInfoClick = (e: React.MouseEvent) => {
        onInfo?.(friend.username);
        // Store click offset relative to the Info button so resize can recompute
        if (infoItemRef.current) {
            const rect = infoItemRef.current.getBoundingClientRect();
            clickOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
        updateAnchor(e.clientX, e.clientY);
        setPopoverOpen(true);
    };

    return (
        <>
            {/*
             * Invisible 0×0 div that acts as Popover.Anchor.
             * Its getBoundingClientRect is overridden to return cursor coords.
             */}
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Anchor
                    ref={anchorElRef}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                    }}
                />

                <DropdownMenu.Root
                    open={dropdownOpen}
                    onOpenChange={(open) => {
                        // Block Radix from auto-closing the dropdown while popover is open
                        if (!open && popoverOpen) return;
                        setDropdownOpen(open);
                        if (!open) closePopover();
                    }}
                >
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
                                        maxWidth: source === 'sent' ? 116 : 132,
                                        tooltipIsActive: true,
                                        tooltipTheme: 'light',
                                        tooltipIsAuto: true,
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
                            // Only block Radix's auto-close when the click landed inside
                            // the popover panel — everything else should close normally.
                            onInteractOutside={(e) => {
                                if (e.type !== 'pointerdown') return;
                                const target = e.target as Node;
                                const insidePopover = document
                                    .querySelector(
                                        '[data-radix-popper-content-wrapper]'
                                    )
                                    ?.contains(target);
                                if (insidePopover) e.preventDefault();
                                else closeAll();
                            }}
                            onEscapeKeyDown={closeAll}
                            className="
                                z-50 min-w-[7rem] w-28 bg-white rounded-md border shadow-sm py-1
                                animate-in fade-in-0 zoom-in-95
                                data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                            "
                        >
                            {status === 'pending' && source === 'received' && (
                                <>
                                    <DropdownMenu.Item
                                        className={menuItemGreen}
                                        onSelect={() =>
                                            onAccept?.(friend_req_id)
                                        }
                                    >
                                        <Check className="w-4 h-4 mr-2" />{' '}
                                        Accept
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        className={menuItemRed}
                                        onSelect={() =>
                                            onDecline?.(friend_req_id)
                                        }
                                    >
                                        <X className="w-4 h-4 mr-2" /> Decline
                                    </DropdownMenu.Item>
                                </>
                            )}

                            {status === 'pending' && source === 'sent' && (
                                <DropdownMenu.Item
                                    className={menuItemRed}
                                    onSelect={() => onCancel?.(friend_req_id)}
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </DropdownMenu.Item>
                            )}

                            {status === 'accepted' && (
                                <>
                                    <DropdownMenu.Item
                                        className={menuItemGray}
                                        onSelect={() =>
                                            onChat?.(friend.username)
                                        }
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />{' '}
                                        Chat
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        className={menuItemGray}
                                        onSelect={() =>
                                            onPlay?.(friend.username)
                                        }
                                    >
                                        <GamepadIcon className="w-4 h-4 mr-2" />{' '}
                                        Play
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        className={menuItemRed}
                                        onSelect={() =>
                                            onDelete?.(friend_req_id)
                                        }
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />{' '}
                                        Delete
                                    </DropdownMenu.Item>
                                </>
                            )}

                            {/* Info — e.preventDefault() keeps dropdown open */}
                            <DropdownMenu.Item
                                className={menuItemGray}
                                ref={infoItemRef}
                                onSelect={(e) => {
                                    e.preventDefault();
                                }}
                                onClick={handleInfoClick}
                            >
                                <Info className="w-4 h-4 mr-2" /> Info
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {/* Info popover — opens at cursor, outside click closes both */}
                <Popover.Portal>
                    <Popover.Content
                        side="bottom"
                        align="end"
                        sideOffset={4}
                        onInteractOutside={(e) => {
                            // Ignore everything that isn't an actual click
                            if (e.type !== 'pointerdown') {
                                e.preventDefault();
                                return;
                            }
                            closeAll();
                        }}
                        onEscapeKeyDown={closeAll}
                        className="
                            z-[9999] bg-white rounded-lg border border-slate-200 shadow-md p-3
                            animate-in fade-in-0 zoom-in-95
                            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                        "
                    >
                        <FriendInfoContent
                            user={displayUser}
                            onClose={closePopover}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </>
    );
};

export default FriendListItem;
