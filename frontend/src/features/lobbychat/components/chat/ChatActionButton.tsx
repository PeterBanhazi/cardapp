/**
 * ChatActionButton.tsx
 * ─────────────────────────────────────────────────────────────
 * FSM-alapú gomb. Nincs optimistic update.
 *
 * Logika:
 *   • A szerver állapota (chatRequestsStore) a forrás
 *   • Terminal állapotokban (rejected/cancelled/closed) a gomb
 *     lokálisan dismissálható → idle "Start Chat" nézet
 *   • Ha közben a szerver új állapotot küld → dismiss felülíródik,
 *     az új szerver-állapot jelenik meg azonnal
 *   • A dismiss NEM küld WS üzenetet
 *
 * Szín:
 *   teal  = pozitív / indít
 *   amber = folyamatban / figyelmeztetés
 *   red   = destruktív
 *   slate = terminal / semleges
 *   ghost = offline / inaktív
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    useChatRequestsStore,
    TERMINAL_STATUSES,
} from '../../store/chatRequestsStore';
import { useFriendsStore } from '../../store/friendsStore';

import { canAct, type ChatAction, type ChatRequest } from '../../store/chatFSM';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatActionButtonProps {
    friendUsername: string;
    localUser: string;
    sendAction: any;
    className?: string;
}

type Variant = 'teal' | 'amber' | 'red' | 'slate' | 'ghost';

type ButtonConfig = {
    label: string;
    sublabel?: string;
    action: ChatAction | null;
    variant: Variant;
    isDismissable?: boolean; // true → kattintás = lokális reset, WS nélkül
    disabled?: boolean;
    pulse?: boolean;
};

// ── State → vizuális konfig ───────────────────────────────────────────────────

function resolveConfig(
    req: ChatRequest | null,
    localUser: string,
    isOffline: boolean
): ButtonConfig {
    if (isOffline) {
        return {
            label: 'Offline',
            action: null,
            variant: 'ghost',
            disabled: true,
        };
    }

    if (!req) {
        return { label: 'Start Chat', action: 'send_request', variant: 'teal' };
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
                    // A split Accept/Reject az alábbi render ágban van
                    label: 'Incoming',
                    sublabel: 'Accept / Reject',
                    action: null,
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

        // ── Terminal állapotok — dismissálható ───────────────────────────────
        case 'rejected':
            return {
                label: 'Rejected',
                sublabel: 'Click to reset',
                action: null,
                variant: 'slate',
                isDismissable: true,
            };
        case 'cancelled':
            return {
                label: 'Cancelled',
                sublabel: 'Click to reset',
                action: null,
                variant: 'slate',
                isDismissable: true,
            };
        case 'closed':
            return {
                label: 'Chat Ended',
                sublabel: 'Click to reset',
                action: null,
                variant: 'slate',
                isDismissable: true,
            };

        default:
            return { label: 'Chat', action: 'send_request', variant: 'ghost' };
    }
}

// ── Variant stílusok (változatlan) ────────────────────────────────────────────

const VARIANT_CLASSES: Record<Variant, string> = {
    teal: 'bg-teal-500/15 border-teal-400/40 text-teal-300 hover:bg-teal-500/25 hover:border-teal-300/60',
    amber: 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-300/60',
    red: 'bg-red-500/15 border-red-400/40 text-red-300 hover:bg-red-500/25 hover:border-red-300/60',
    slate: 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300',
    ghost: 'bg-transparent border-slate-700 text-slate-500',
};

// ── Komponens ─────────────────────────────────────────────────────────────────

export function ChatActionButton({
    friendUsername,
    localUser,
    sendAction,
    className = '',
}: ChatActionButtonProps) {
    // ── Store subscriptions ───────────────────────────────────────────────────
    const req = useChatRequestsStore((s) =>
        s.getRequestForPair(localUser, friendUsername)
    );
    const friendStatus = useFriendsStore(
        (s) => s.friends[friendUsername]?.status ?? 'unknown'
    );
    const isOffline = friendStatus === 'offline';

    // ── Lokális dismiss állapot ───────────────────────────────────────────────
    // Csak terminal állapotokban aktív. Ha a szerver új state-t küld (req változik),
    // az effect nullázza → a szerver state jelenik meg azonnal.
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Ha a szerver új adatot küld (req_id vagy status változik), töröljük a dismiss-t
        setIsDismissed(false);
    }, [req?.req_id, req?.status]);

    // ── Effektív request: dismiss esetén null → idle nézet ───────────────────
    const effectiveReq = isDismissed ? null : req;
    const config = resolveConfig(effectiveReq, localUser, isOffline);

    // ── WS action → Django Channels handler neve ─────────────────────────────
    const WS_HANDLER: Record<ChatAction, string> = {
        send_request: 'chat_request', // handle_chat_request
        accept: 'accept_chat', // handle_accept_chat
        reject: 'reject_chat', // handle_reject_chat
        cancel: 'cancel_chat', // handle_cancel_chat
        close: 'close_chat', // handle_close_chat
    };

    // ── Akció küldése ─────────────────────────────────────────────────────────
    const fire = useCallback(
        (action: ChatAction) => {
            // FSM guard — ha a szerver state nem engedi, nem küldünk
            if (!canAct(action, effectiveReq ?? null, localUser)) return;

            sendAction(action, {
                action: WS_HANDLER[action], // ez megy a backendnek data["action"]-ként
                user_from: localUser,
                user_to: friendUsername,
                ...(effectiveReq?.req_id
                    ? { req_id: effectiveReq.req_id }
                    : {}),
            });
        },
        [effectiveReq, localUser, friendUsername, sendAction]
    );

    // ── Dismiss: csak lokális reset, nincs WS ────────────────────────────────
    const handleDismiss = useCallback(() => {
        if (req && TERMINAL_STATUSES.has(req.status as any)) {
            setIsDismissed(true);
        }
    }, [req]);

    // ── Incoming pending: split Accept / Reject ───────────────────────────────
    if (
        req?.status === 'pending' &&
        localUser === req.user_to &&
        !isOffline &&
        !isDismissed
    ) {
        return (
            <div className={`flex gap-1.5 ${className}`}>
                <ActionBtn
                    label="Accept"
                    variant="teal"
                    pulse
                    onClick={() => fire('accept')}
                />
                <ActionBtn
                    label="Reject"
                    variant="red"
                    onClick={() => fire('reject')}
                />
            </div>
        );
    }

    // ── Normál egygombos nézet ────────────────────────────────────────────────
    const handleClick = config.isDismissable
        ? handleDismiss
        : config.action
          ? () => fire(config.action as ChatAction)
          : undefined;

    return (
        <ActionBtn
            label={config.label}
            sublabel={config.sublabel}
            variant={config.variant}
            pulse={config.pulse}
            disabled={
                config.disabled || (!config.action && !config.isDismissable)
            }
            onClick={handleClick}
            className={className}
        />
    );
}

// ── Primitív gomb (kinézet változatlan) ──────────────────────────────────────

interface ActionBtnProps {
    label: string;
    sublabel?: string;
    variant: Variant;
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
                'group relative flex flex-col items-center justify-center',
                'min-w-[96px] px-3 py-1.5 rounded',
                'border font-mono text-xs tracking-widest uppercase',
                'transition-all duration-150 select-none',
                VARIANT_CLASSES[variant ?? 'ghost'],
                disabled
                    ? 'opacity-40 cursor-not-allowed pointer-events-none'
                    : 'cursor-pointer',
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
