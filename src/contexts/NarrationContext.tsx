import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { activeSection } from '../lib/activeSection';
import { clipIndex, PLAYLIST } from '../lib/narrationClips';
import { clearFlashes, flash, indexTerms, namedMoments, type NamedMoment } from '../lib/narrationHighlights';
import { NarrationContext, NarrationProgressContext, NO_PROGRESS, type NarrationStatus } from './narrationContextValue';

const clipIds = PLAYLIST.map((clip) => clip.id);

// The section the visitor is looking at (same rule as the nav scrollspy), falling back
// to the first clip.
const sectionInView = () => activeSection(clipIds, clipIds[0]);

// Scroll position for `time` seconds into a clip, so the page tours its section in step
// with the narration: the heading first, then each element as it is named (arriving just
// before the word), then the section's end as the clip finishes. Positions are measured
// live, so layout changes are fine, and the tour only ever moves down the page.
const NAV_OFFSET = 90; // fixed navbar; matches scroll-padding-top in index.css
const HOLD_START = 0.08; // keep the heading in view for the first 8% of the clip…
const REACH_END = 0.92; // …and reach the section's end by 92%, before the next clip starts
const LEAD = 0.5; // seconds to arrive at a named element before its name is spoken
const FOCUS = 0.3; // a named element sits 30% of the way down the visible area

function followTarget(section: HTMLElement, time: number, duration: number, moments: NamedMoment[]) {
  // Visible area: between the navbar and the floating player (and bottom nav on phones).
  const playerTop = document.querySelector('[aria-label="Voice guide player"]')?.getBoundingClientRect().top;
  const bandTop = NAV_OFFSET + 16;
  const bandHeight = (playerTop ?? window.innerHeight) - 16 - bandTop;
  const rect = section.getBoundingClientRect();
  const start = window.scrollY + rect.top - NAV_OFFSET;
  const end = start + Math.max(0, rect.height - bandHeight);

  // [time, scroll] waypoints, both kept non-decreasing.
  const points: [number, number][] = [[0, start], [duration * HOLD_START, start]];
  const add = (at: number, scroll: number) => {
    const [lastAt, lastScroll] = points[points.length - 1];
    points.push([Math.max(at, lastAt), Math.max(scroll, lastScroll)]);
  };
  for (const { time: spokenAt, elements } of moments) {
    if (!elements[0].isConnected) continue;
    add(spokenAt - LEAD, window.scrollY + elements[0].getBoundingClientRect().top - bandTop - bandHeight * FOCUS);
  }
  add(duration * REACH_END, end);

  // Linear between waypoints (the per-frame easing smooths the corners).
  for (let i = 1; i < points.length; i++) {
    const [t1, s1] = points[i];
    if (time <= t1) {
      const [t0, s0] = points[i - 1];
      return t1 > t0 ? s0 + ((s1 - s0) * (time - t0)) / (t1 - t0) : s1;
    }
  }
  return points[points.length - 1][1];
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Input that means the visitor wants to scroll themselves. Keys typed into a control (the
// seek bar's arrows, Space on a button) don't count.
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const isScrollKey = (event: KeyboardEvent) =>
  SCROLL_KEYS.has(event.key) && !(event.target instanceof HTMLElement && event.target.closest('input, textarea, select, button, a'));

export function NarrationProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [status, setStatus] = useState<NarrationStatus>('idle');
  const [autoPlay, setAutoPlayState] = useState(false);
  const [progress, setProgress] = useState(NO_PROGRESS);

  // ONE audio element for every clip. Browsers only allow sound after a user gesture,
  // and that permission sticks to the element — so reusing it is what lets the tour move
  // on to the next section by itself (notably on iOS Safari).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Mirrors of state for the audio event handlers, which are bound once on mount.
  const currentRef = useRef<string | null>(null);
  const autoPlayRef = useRef(false);
  // Whether the page follows the narration through the section. Off once the visitor
  // scrolls by hand; back on with the next clip, a seek, or pressing play again.
  const followRef = useRef(true);

  const setAutoPlay = useCallback((on: boolean) => {
    autoPlayRef.current = on;
    setAutoPlayState(on);
  }, []);

  // Every way the player ends — the tour's last clip, a failed clip, or closing it —
  // also ends the tour, so a later single-section listen doesn't unexpectedly carry on
  // through the rest of the page.
  const reset = useCallback(() => {
    currentRef.current = null;
    setCurrentId(null);
    setStatus('idle');
    setProgress(NO_PROGRESS);
    setAutoPlay(false);
  }, [setAutoPlay]);

  const playClip = useCallback((id: string, scroll: boolean) => {
    const audio = audioRef.current;
    const clip = PLAYLIST[clipIndex(id)];
    if (!audio || !clip) return;
    currentRef.current = id;
    followRef.current = true;
    setCurrentId(id);
    setProgress(NO_PROGRESS);
    setStatus('loading');
    audio.src = clip.url;
    audio.play().catch(() => {
      // Rejected because playback was blocked, or because a newer clip replaced this
      // one. Only the first case leaves this clip current — show it as paused so the
      // visitor can press play again.
      if (currentRef.current === id) setStatus('paused');
    });
    // Normally the follow loop below glides to the section. With reduced motion there is
    // no gliding, so jump straight to the section's top instead.
    if (scroll && prefersReducedMotion()) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlaying = () => setStatus('playing');
    const onPause = () => {
      // Ignore the pause that fires when a clip ends or its source is swapped out.
      if (currentRef.current && !audio.ended && audio.readyState > 0) setStatus('paused');
    };
    // Also on loadedmetadata, so the total time shows before playback starts.
    const onTime = () => setProgress({
      current: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    });
    const onEnded = () => {
      const nextClip = PLAYLIST[clipIndex(currentRef.current) + 1];
      if (autoPlayRef.current && nextClip) playClip(nextClip.id, true);
      else reset();
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', reset);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', reset);
      audio.pause();
      audioRef.current = null;
    };
  }, [playClip, reset]);

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentRef.current) return;
    if (audio.paused) {
      followRef.current = true;
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !currentRef.current || !Number.isFinite(audio.duration)) return;
    followRef.current = true;
    audio.currentTime = Math.min(Math.max(0, seconds), audio.duration);
    setProgress({ current: audio.currentTime, duration: audio.duration });
  }, []);

  // The visitor scrolling by hand takes over from the follow loop.
  useEffect(() => {
    const takeOver = () => { followRef.current = false; };
    const onKey = (event: KeyboardEvent) => { if (isScrollKey(event)) takeOver(); };
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchmove', takeOver, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchmove', takeOver);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Each frame while a clip plays:
  //  - light up page elements as they are named (lib/narrationHighlights);
  //  - tour the section in step with the narration, easing the page a little toward
  //    followTarget's position. Scrolls with behavior 'instant' so the page's CSS smooth
  //    scrolling doesn't restart an animation every frame.
  // Paused clips hold still.
  useEffect(() => {
    if (!currentId || (status !== 'playing' && status !== 'loading')) return;
    const section = document.getElementById(currentId);
    if (!section) return;
    const words = PLAYLIST[clipIndex(currentId)]?.words ?? [];
    const moments: NamedMoment[] = namedMoments(words, indexTerms(currentId));
    const follow = !prefersReducedMotion();
    // Moments already reached. Starts at the current time, so resuming doesn't replay
    // everything named earlier.
    const passed = (time: number) => moments.filter((moment) => moment.time <= time).length;
    let reached = passed(audioRef.current?.currentTime ?? 0);

    let frame = requestAnimationFrame(function tick() {
      const audio = audioRef.current;
      if (audio) {
        const now = passed(audio.currentTime);
        // Light up what was just named, unless the visitor seeked ahead past several.
        if (now > reached && now - reached <= 3) moments.slice(reached, now).forEach(({ elements }) => elements.forEach(flash));
        reached = now;
        if (follow && followRef.current) {
          const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
          const gap = followTarget(section, audio.currentTime, duration, moments) - window.scrollY;
          if (Math.abs(gap) > 0.5) window.scrollTo({ top: window.scrollY + gap * 0.08, behavior: 'instant' });
        }
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [currentId, status]);

  const getTime = useCallback(() => audioRef.current?.currentTime ?? 0, []);

  // Spotlight the section being narrated (styled by section[data-narrating] in index.css).
  useEffect(() => {
    if (!currentId) return;
    const section = document.getElementById(currentId);
    section?.setAttribute('data-narrating', '');
    return () => {
      section?.removeAttribute('data-narrating');
      clearFlashes();
    };
  }, [currentId]);

  const toggleSection = useCallback((id: string) => {
    if (currentRef.current === id) togglePause();
    else playClip(id, false);
  }, [playClip, togglePause]);

  const startTour = useCallback(() => {
    setAutoPlay(true);
    playClip(sectionInView(), true);
  }, [playClip, setAutoPlay]);

  const step = useCallback((delta: number) => {
    const target = PLAYLIST[clipIndex(currentRef.current) + delta];
    if (currentRef.current && target) playClip(target.id, true);
  }, [playClip]);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const stop = useCallback(() => {
    reset();
    audioRef.current?.pause();
  }, [reset]);

  const value = useMemo(
    () => ({ currentId, status, autoPlay, toggleSection, startTour, togglePause, next, prev, stop, setAutoPlay, seek, getTime }),
    [currentId, status, autoPlay, toggleSection, startTour, togglePause, next, prev, stop, setAutoPlay, seek, getTime],
  );

  return (
    <NarrationContext.Provider value={value}>
      <NarrationProgressContext.Provider value={progress}>{children}</NarrationProgressContext.Provider>
    </NarrationContext.Provider>
  );
}
