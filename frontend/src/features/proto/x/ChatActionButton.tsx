/**
 * ChatActionButton.tsx
 * ─────────────────────────────────────────────────────────────
 * A single button that renders the correct label, style, and
 * affordance for every FSM state a chat request can be in.
 *
 * Design: dark-mode, monospace aesthetic — industrial/utilitarian.
 * Colour language:
 *   teal    = positive / initiate
 *   amber   = in-progress / warning
 *   red     = destructive / end
 *   slate   = terminal / neutral
 */

import React, { useCallback } from 'react';
import { useChatRequestsStore } from './chatRequestsStore';
import { useFriendsStore } from './friendsStore';
import { useSystemSocket } from './useSystemSocket';
import { canAct, type ChatRequest, type ChatAction } from './chatFSM';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatActionButtonProps {
    /** Username of the friend this button is for */
    friendUsername: string;
    /** Currently logged-in user */
    localUser: string;
    /** WebSocket send fn from useSystemSocket */
    sendAction: ReturnType<typeof useSystemSocket>['sendAction'];
    className?: string;
}

// ── State → visual config ─────────────────────────────────────────────────────

type ButtonConfig = {
    label: string;
    sublabel?: string;
    action: ChatAction | null; // null = no action available from this state
    variant: 'teal' | 'amber' | 'red' | 'slate' | 'ghost';
    disabled?: boolean;
    pulse?: boolean;
};

function resolveConfig(
    req: ChatRequest | null,
    localUser: string,
    isPending: boolean
): ButtonConfig {
    // ── Optimistic in-flight ─────────────────────────────────────────────
    if (isPending) {
        return {
            label: '···',
            action: null,
            variant: 'slate',
            disabled: true,
        };
    }

    if (!req) {
        return {
            label: 'Start Chat',
            action: 'send_request',
            variant: 'teal',
        };
    }

    const isFrom = localUser === req.user_from;
    const isTo = localUser === req.user_to;

    switch (req.status) {
        case 'pending':
            if (isFrom)
                return {
                    label: 'Pending',
                    sublabel: 'Cancel?',
                    action: 'cancel',
                    variant: 'amber',
                    pulse: true,
                };
            if (isTo)
                return {
                    label: 'Incoming Request',
                    sublabel: 'Accept / Reject',
                    action: null, // multiple actions — handled via split render
                    variant: 'amber',
                    pulse: true,
                };
            return { label: 'Pending', action: null, variant: 'amber' };

        case 'accepted':
            return {
                label: 'In Chat',
                sublabel: 'Close?',
                action: 'close',
                variant: 'teal',
            };

        case 'rejected':
            return {
                label: 'Rejected',
                sublabel: 'Try again',
                action: 'send_request',
                variant: 'slate',
            };

        case 'cancelled':
            return {
                label: 'Cancelled',
                sublabel: 'New request',
                action: 'send_request',
                variant: 'slate',
            };

        case 'closed':
            return {
                label: 'Chat Ended',
                sublabel: 'New request',
                action: 'send_request',
                variant: 'slate',
            };

        default:
            return { label: 'Chat', action: 'send_request', variant: 'ghost' };
    }
}

// ── Variant styles ────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<NonNullable<ButtonConfig['variant']>, string> = {
    teal: 'bg-teal-500/15 border-teal-400/40 text-teal-300 hover:bg-teal-500/25 hover:border-teal-300/60',
    amber: 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-300/60',
    red: 'bg-red-500/15 border-red-400/40 text-red-300 hover:bg-red-500/25 hover:border-red-300/60',
    slate: 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300',
    ghost: 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatActionButton({
    friendUsername,
    localUser,
    sendAction,
    className = '',
}: ChatActionButtonProps) {
    const req = useChatRequestsStore((s) =>
        s.getRequestForPair(localUser, friendUsername)
    );
    const reqId = req?.req_id ?? null;
    const pending = useChatRequestsStore((s) =>
        reqId ? s.isPending(reqId) : false
    );
    const { optimisticallyApply, revertOptimistic } =
        useChatRequestsStore.getState();

    const config = resolveConfig(req, localUser, pending);

    const fire = useCallback(
        (action: ChatAction) => {
            if (!canAct(action, req ?? null, localUser)) return;

            const skeleton =
                action === 'send_request'
                    ? { user_to: friendUsername }
                    : undefined;

            const accepted = optimisticallyApply(
                action,
                reqId,
                localUser,
                skeleton
            );
            if (!accepted) return;

            // Map ChatAction → backend action name
            const wsAction: Record<ChatAction, string> = {
                send_request: 'chat_request',
                accept: 'accept_chat',
                reject: 'reject_chat',
                cancel: 'cancel_chat',
                close: 'close_chat',
            };

            sendAction(action, {
                action: wsAction[action],
                user_from: localUser,
                user_to: friendUsername,
                ...(req?.req_id ? { req_id: req.req_id } : {}),
            });
        },
        [
            req,
            reqId,
            localUser,
            friendUsername,
            sendAction,
            optimisticallyApply,
            revertOptimistic,
        ]
    );

    // ── Incoming request: split Accept / Reject ───────────────────────────────
    if (req?.status === 'pending' && localUser === req.user_to) {
        return (
            <div className={`flex gap-1.5 ${className}`}>
                <ActionBtn
                    label="Accept"
                    variant="teal"
                    pulse
                    onClick={() => fire('accept')}
                    disabled={pending}
                />
                <ActionBtn
                    label="Reject"
                    variant="red"
                    onClick={() => fire('reject')}
                    disabled={pending}
                />
            </div>
        );
    }

    // ── Standard single button ─────────────────────────────────────────────────
    return (
        <ActionBtn
            label={config.label}
            sublabel={config.sublabel}
            variant={config.variant}
            pulse={config.pulse}
            disabled={config.disabled || !config.action}
            onClick={config.action ? () => fire(config.action!) : undefined}
            className={className}
        />
    );
}

// ── Primitive button ──────────────────────────────────────────────────────────

interface ActionBtnProps {
    label: string;
    sublabel?: string;
    variant: ButtonConfig['variant'];
    pulse?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

function ActionBtn({
    label,
    sublabel,
    variant,
    pulse,
    disabled,
    onClick,
    className = '',
}: ActionBtnProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                // Base
                'group relative flex flex-col items-center justify-center',
                'min-w-[96px] px-3 py-1.5 rounded',
                'border font-mono text-xs tracking-widest uppercase',
                'transition-all duration-150 select-none',
                // Variant
                VARIANT_CLASSES[variant ?? 'ghost'],
                // Disabled override
                disabled
                    ? 'opacity-40 cursor-not-allowed pointer-events-none'
                    : 'cursor-pointer',
                // Pulse ring
                pulse && !disabled
                    ? 'after:absolute after:inset-0 after:rounded after:border after:border-current after:opacity-0 after:scale-100 after:animate-ping-slow'
                    : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
        >
            <span>{label}</span>
            {sublabel && (
                <span className="text-[9px] opacity-50 group-hover:opacity-80 transition-opacity mt-0.5 normal-case tracking-wide">
                    {sublabel}
                </span>
            )}
        </button>
    );
}
