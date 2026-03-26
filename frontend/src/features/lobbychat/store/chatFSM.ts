/**
 * chatFSM.ts
 * ─────────────────────────────────────────────────────────────
 * A szerver Redis FSM-jének tükörképe.
 * Csak arra használjuk, hogy a UI meghatározza:
 *   1. Melyik gombot kell megjeleníteni
 *   2. Szabad-e az adott akciót elküldeni
 *
 * Optimistic update nincs — a szerver válasza frissíti az állapotot.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "closed";

export type ChatAction =
  | "send_request" // bárki kezdeményezhet terminal állapotból
  | "accept"       // csak user_to
  | "reject"       // csak user_to
  | "cancel"       // csak user_from
  | "close";       // bármelyik fél

export interface ChatRequest {
  req_id:     string;
  user_from:  string;
  user_to:    string;
  status:     ChatStatus;
  created_at: number; // unix timestamp (s)
  updated_at: number;
}

// ── Transition table ──────────────────────────────────────────────────────────

const TRANSITIONS: Record<
  ChatStatus | "none",
  Partial<Record<ChatAction, ChatStatus>>
> = {
  none:      { send_request: "pending" },
  pending:   { accept: "accepted", reject: "rejected", cancel: "cancelled" },
  accepted:  { close: "closed" },
  // Terminal → bármelyik fél új requestet küldhet
  rejected:  { send_request: "pending" },
  cancelled: { send_request: "pending" },
  closed:    { send_request: "pending" },
};

// Ki küldhet az adott akciót
const ACTION_ACTOR: Record<ChatAction, "from" | "to" | "both"> = {
  send_request: "both",  // terminal esetén bárki lehet az új user_from
  accept:       "to",
  reject:       "to",
  cancel:       "from",
  close:        "both",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Szabad-e a localUser-nek ezt az akciót elküldeni? */
export function canAct(
  action:    ChatAction,
  request:   ChatRequest | null,
  localUser: string,
): boolean {
  const current = request?.status ?? "none";
  const allowed = TRANSITIONS[current];
  if (!allowed || !(action in allowed)) return false;

  const rule = ACTION_ACTOR[action];
  if (rule === "both") return true;
  if (!request)        return true; // nincs még request → a localUser lesz user_from

  if (rule === "from") return localUser === request.user_from;
  if (rule === "to")   return localUser === request.user_to;
  return false;
}
