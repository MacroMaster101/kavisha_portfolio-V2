import type { CaptionWord } from './narrationClips';

// Elements the voice guide lights up as their name is spoken. Mark one with
// data-narration-term — its spoken phrases, "|"-separated when there are several
// (e.g. "C#|C sharp") — and it's matched against the clip's word timings.

const HIT_MS = 1800;

const normalizeWord = (word: string) =>
  word
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^a-z0-9#+]+|[^a-z0-9#+]+$/g, '')
    .replace(/'s$/, '');

const normalizePhrase = (words: string[]) => words.map(normalizeWord).filter(Boolean).join(' ');

export interface TermIndex {
  elements: Map<string, HTMLElement[]>;
  longest: number;
}

// The marked elements of a narrated section. Elements outside it can join with
// data-narration-scope="<section id>" on an ancestor (Projects' "Everything Else" grid).
export function indexTerms(sectionId: string): TermIndex {
  const elements = new Map<string, HTMLElement[]>();
  let longest = 1;
  const marked = document.querySelectorAll<HTMLElement>(
    `#${sectionId} [data-narration-term], [data-narration-scope="${sectionId}"] [data-narration-term]`,
  );
  for (const element of marked) {
    for (const phrase of (element.dataset.narrationTerm ?? '').split('|')) {
      const words = phrase.trim().split(/\s+/);
      const key = normalizePhrase(words);
      if (!key) continue;
      longest = Math.max(longest, words.length);
      elements.set(key, [...(elements.get(key) ?? []), element]);
    }
  }
  return { elements, longest };
}

// The longest phrase ending at word `index`, if any.
function longestMatch(words: CaptionWord[], index: number, terms: TermIndex) {
  for (let length = Math.min(terms.longest, index + 1); length >= 1; length--) {
    const key = normalizePhrase(words.slice(index - length + 1, index + 1).map(([text]) => text));
    const elements = terms.elements.get(key);
    if (elements) return { elements, length };
  }
  return null;
}

export interface NamedMoment {
  /** Seconds into the clip when the name finishes being spoken. */
  time: number;
  elements: HTMLElement[];
}

// Every moment in a clip where a marked element is named, in order. A phrase that a
// longer one continues is skipped, so "React Native" lights React Native — not React
// for a moment first.
export function namedMoments(words: CaptionWord[], terms: TermIndex): NamedMoment[] {
  const moments: NamedMoment[] = [];
  words.forEach((word, index) => {
    const match = longestMatch(words, index, terms);
    if (!match) return;
    for (let end = index + 1; end < Math.min(words.length, index + terms.longest); end++) {
      const later = longestMatch(words, end, terms);
      if (later && end - later.length + 1 <= index) return;
    }
    moments.push({ time: word[1], elements: match.elements });
  });
  return moments;
}

const timers = new WeakMap<HTMLElement, number>();

// Light an element up for a moment (styled by [data-narration-hit] in index.css).
export function flash(element: HTMLElement) {
  window.clearTimeout(timers.get(element));
  element.setAttribute('data-narration-hit', '');
  timers.set(element, window.setTimeout(() => element.removeAttribute('data-narration-hit'), HIT_MS));
}

export function clearFlashes() {
  for (const element of document.querySelectorAll<HTMLElement>('[data-narration-hit]')) {
    window.clearTimeout(timers.get(element));
    element.removeAttribute('data-narration-hit');
  }
}
