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
  | "send_request"   // opens a new request; either party can do this from terminal states
  | "accept"         // actor = user_to only
  | "reject"         // actor = user_to only
  | "cancel"         // actor = user_from only
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
// [currentStatus | "none"] → { action → nextStatus }
const TRANSITIONS: Record<ChatStatus | "none", Partial<Record<ChatAction, ChatStatus>>> = {
  none:      { send_request: "pending" },
  pending:   { accept: "accepted", reject: "rejected", cancel: "cancelled" },
  accepted:  { close: "closed" },
  // Terminal states — EITHER party can re-open with a new request
  rejected:  { send_request: "pending" },
  cancelled: { send_request: "pending" },
  closed:    { send_request: "pending" },
};

// Which role is allowed to fire each action.
// "both" means any authenticated participant of the pair.
// send_request is "both" because on terminal states EITHER side can re-initiate;
// whoever clicks becomes the new user_from on the server.
const ACTION_ACTOR: Record<ChatAction, "from" | "to" | "both"> = {
  send_request: "both",
  accept:       "to",
  reject:       "to",
  cancel:       "from",
  close:        "both",
};

// ── FSM helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if `localUser` is allowed to fire `action` given the current request.
 */
export function canAct(
  action:    ChatAction,
  request:   ChatRequest | null,
  localUser: string,
): boolean {
  const currentStatus = request?.status ?? "none";
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed || !(action in allowed)) return false;

  const actorRule = ACTION_ACTOR[action];
  if (actorRule === "both") return true;

  // No prior request → local user is always the initiator
  if (!request) return true;

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
  const all: ChatAction[] = ["send_request", "accept", "reject", "cancel", "close"];
  return all.filter(a => canAct(a, request, localUser));
}

/**
 * Optimistically applies an action and returns the expected next status.
 * Used to update local state before the server confirms.
 */
export function applyOptimistic(
  action:  ChatAction,
  request: ChatRequest | null,
): ChatStatus | null {
  const currentStatus = request?.status ?? "none";
  return TRANSITIONS[currentStatus]?.[action] ?? null;
}
