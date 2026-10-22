import { createContext } from 'react';

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused';

interface NarrationContextType {
  /** Section id of the clip that is loaded (playing or paused), or null when stopped. */
  currentId: string | null;
  status: NarrationStatus;
  /** When on, the guide scrolls to and narrates the next section as each clip ends. */
  autoPlay: boolean;
  /** Play this section's clip, or pause/resume it if it is already the current one. */
  toggleSection: (id: string) => void;
  /** Start the auto-playing tour from whichever section is on screen. */
  startTour: () => void;
  togglePause: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  setAutoPlay: (on: boolean) => void;
  /** Jump to this many seconds into the current clip. */
  seek: (seconds: number) => void;
  /** Exact playback position right now, for per-frame readers like the captions. */
  getTime: () => number;
}

export const NarrationContext = createContext<NarrationContextType | undefined>(undefined);

export interface NarrationProgress {
  /** Seconds played of the current clip. */
  current: number;
  /** Clip length in seconds, or 0 until it is known. */
  duration: number;
}

export const NO_PROGRESS: NarrationProgress = { current: 0, duration: 0 };

/** Playback position. A context of its own because it changes several times a second,
 *  and only the player's seek bar and time readout need it. */
export const NarrationProgressContext = createContext<NarrationProgress>(NO_PROGRESS);
