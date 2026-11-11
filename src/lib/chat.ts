// Browser-side helpers for the chat assistant (components/ui/ChatAssistant). The limits
// mirror server/chat/handler.ts, which enforces them.

export const CHAT_MAX_INPUT = 600;
const MAX_TURNS = 12;
const MAX_ASSISTANT_CHARS = 2400;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** A failed exchange: shown to the visitor, never sent back to the model. */
  failed?: boolean;
}

/**
 * The conversation to post: completed exchanges only (failed ones and their question
 * dropped), the latest MAX_TURNS turns, starting on a visitor message.
 */
export function buildTurns(history: ChatMessage[], question: string): { role: 'user' | 'assistant'; content: string }[] {
  const turns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (let i = 0; i + 1 < history.length; i += 2) {
    const [asked, answered] = [history[i], history[i + 1]];
    if (asked.role !== 'user' || answered.role !== 'assistant' || answered.failed || !answered.content.trim()) continue;
    turns.push({ role: 'user', content: asked.content });
    turns.push({ role: 'assistant', content: answered.content.slice(0, MAX_ASSISTANT_CHARS) });
  }
  turns.push({ role: 'user', content: question });
  const recent = turns.slice(-MAX_TURNS);
  return recent[0].role === 'user' ? recent : recent.slice(1);
}

export type TextPart = { type: 'text'; text: string } | { type: 'link'; text: string; href: string };

const LINK = /(https?:\/\/[^\s<>"')\]]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Splits an answer into text and links (web URLs and email addresses). */
export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    let raw = match[0];
    // Sentence punctuation right after a link isn't part of it.
    const trailing = raw.match(/[.,;:!?]+$/)?.[0] ?? '';
    raw = raw.slice(0, raw.length - trailing.length);
    const start = match.index;
    if (start > last) parts.push({ type: 'text', text: text.slice(last, start) });
    parts.push({ type: 'link', text: raw, href: raw.includes('@') && !raw.startsWith('http') ? `mailto:${raw}` : raw });
    last = start + raw.length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}
