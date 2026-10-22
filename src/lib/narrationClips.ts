import { NARRATION } from '../data/narration';

/** A spoken word: [text, start, end], in seconds into the clip. */
export type CaptionWord = [text: string, start: number, end: number];

// Clips that actually exist in src/assets/narration, resolved at build time. A section
// whose clip hasn't been generated yet simply has no listen button and is skipped by the
// tour, instead of offering a control that would fail on click.
const urls = import.meta.glob<string>('../assets/narration/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Word timings written next to each clip by `npm run narration`, for the live captions.
const timings = import.meta.glob<CaptionWord[]>('../assets/narration/*.json', {
  eager: true,
  import: 'default',
});

const urlFor = (id: string) => urls[`../assets/narration/${id}.mp3`];

export const PLAYLIST = NARRATION.filter((clip) => urlFor(clip.id)).map((clip) => ({
  ...clip,
  url: urlFor(clip.id),
  words: timings[`../assets/narration/${clip.id}.json`] ?? [],
}));

export const clipIndex = (id: string | null) => PLAYLIST.findIndex((clip) => clip.id === id);

// Index of the word being spoken at `time`: the last one that has started (-1 before it).
export function wordAt(words: CaptionWord[], time: number) {
  let low = 0;
  let high = words.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (words[mid][1] <= time) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}

export const hasClip = (id: string) => clipIndex(id) !== -1;
