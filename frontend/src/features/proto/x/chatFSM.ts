/**
 * chatFSM.ts
 * ─────────────────────────────────────────────────────────────
 * Mirrors the backend Redis state machine exactly.
 * The FSM is the ONLY place that decides whether a UI action is legal.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ChatStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "closed";

export type ChatAction =
  | "send_request"   // actor = local user (user_from)
  | "accept"         // actor = local user (user_to)
  | "reject"         // actor = local user (user_to)
  | "cancel"         // actor = local user (user_from)
  | "close";         // actor = either party

export interface ChatRequest {
  req_id:     string;
  user_from:  string;
  user_to:    string;
  status:     ChatStatus;
  created_at: number;   // unix timestamp (seconds)
  updated_at: number;
}

// ── Transition table ────────────────────────────────────────────────────────
// [currentStatus | null] → allowed target statuses
const TRANSITIONS: Record<ChatStatus | "none", Partial<Record<ChatAction, ChatStatus>>> = {
  none:      { send_request: "pending" },
  pending:   { accept: "accepted", reject: "rejected", cancel: "cancelled" },
  accepted:  { close: "closed" },
  rejected:  { send_request: "pending" },
  cancelled: { send_request: "pending" },
  closed:    { send_request: "pending" },
};

// Which role is allowed to fire each action
const ACTION_ACTOR: Record<ChatAction, "from" | "to" | "both"> = {
  send_request: "from",
  accept:       "to",
  reject:       "to",
  cancel:       "from",
  close:        "both",
};

// ── FSM helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if `actor` is allowed to fire `action` on `request`.
 * `localUser` is the username of the currently logged-in user.
 */
export function canAct(
  action:     ChatAction,
  request:    ChatRequest | null,
  localUser:  string,
): boolean {
  const currentStatus = request?.status ?? "none";
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed || !(action in allowed)) return false;

  const actorRule = ACTION_ACTOR[action];
  if (actorRule === "both") return true;
  if (!request) return actorRule === "from"; // new request — local user is always "from"

  if (actorRule === "from") return localUser === request.user_from;
  if (actorRule === "to")   return localUser === request.user_to;
  return false;
}

/**
 * Returns every action the local user is currently allowed to fire.
 */
export function availableActions(
  request:   ChatRequest | null,
  localUser: string,
): ChatAction[] {
  const actions: ChatAction[] = [
    "send_request", "accept", "reject", "cancel", "close",
  ];
  return actions.filter(a => canAct(a, request, localUser));
}

/**
 * Optimistically applies an action and returns the next status.
 * Used to update local state before the server confirms.
 */
export function applyOptimistic(
  action:  ChatAction,
  request: ChatRequest | null,
): ChatStatus | null {
  const currentStatus = request?.status ?? "none";
  return TRANSITIONS[currentStatus]?.[action] ?? null;
}
