import { useCallback, useEffect, useState } from 'react';

// First-run hints pointing at features a visitor may miss (the theme toggle, the voice
// guide). A hint shows once per visit, on up to MAX_VISITS visits, until the visitor
// uses the feature or closes the hint — after either, never again. They are staggered
// (see HINT_DELAY) so two never show at once.

export type HintName = 'theme' | 'voice-guide';

const MAX_VISITS = 3;
const SHOW_MS = 8000;

// When each hint appears, in ms after the page becomes interactive (the intro loader
// gone). The voice guide waits for the theme hint to finish when that one is due.
export const HINT_DELAY = { theme: 2500, voiceGuide: 2500 + SHOW_MS + 1500, voiceGuideAlone: 3500 };

interface HintState {
  visits?: number;
  done?: boolean;
}

const key = (name: HintName) => `hint:${name}`;

function read(name: HintName): HintState {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key(name)) ?? '{}');
    return typeof value === 'object' && value !== null ? (value as HintState) : {};
  } catch {
    return {};
  }
}

function write(name: HintName, state: HintState) {
  try { localStorage.setItem(key(name), JSON.stringify(state)); } catch { /* storage unavailable */ }
}

const shownThisVisit = (name: HintName) => {
  try { return sessionStorage.getItem(key(name)) === '1'; } catch { return false; }
};

/** Whether `name` will be shown on this visit. */
export function hintDue(name: HintName) {
  const state = read(name);
  return !state.done && (state.visits ?? 0) < MAX_VISITS && !shownThisVisit(name);
}

/** The visitor used the feature, or closed its hint: don't show it again. */
export function completeHint(name: HintName) {
  write(name, { ...read(name), done: true });
}

/**
 * Shows hint `name` `delayMs` after `enabled` turns true, for SHOW_MS, if it's due.
 * Returns whether it's showing and a function that closes it for good.
 */
export function useHint(name: HintName, delayMs: number, enabled: boolean): [boolean, () => void] {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !hintDue(name)) return;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const showTimer = setTimeout(() => {
      if (!hintDue(name)) return; // used or closed in the meantime
      write(name, { ...read(name), visits: (read(name).visits ?? 0) + 1 });
      try { sessionStorage.setItem(key(name), '1'); } catch { /* storage unavailable */ }
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), SHOW_MS);
    }, delayMs);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [name, delayMs, enabled]);

  const close = useCallback(() => {
    setVisible(false);
    completeHint(name);
  }, [name]);

  return [visible, close];
}
