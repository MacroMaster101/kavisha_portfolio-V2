import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, Loader2, Pause, Play, SkipBack, SkipForward, Sparkles, X } from 'lucide-react';
import { completeHint, HINT_DELAY, hintDue, useHint } from '../../lib/hints';
import { clipIndex, PLAYLIST } from '../../lib/narrationClips';
import { useNarration, useNarrationProgress } from '../../contexts/useNarration';
import { NarrationCaptions } from './NarrationCaptions';

const controlClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors disabled:opacity-30 disabled:pointer-events-none';

// Elapsed time rounds down (like any player); the total rounds to the nearest second.
const formatTime = (seconds: number, round = Math.floor) => {
  const whole = round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

// The two progress consumers are their own components, so a progress tick (several a
// second) re-renders them and nothing else.

function TimeReadout() {
  const { current, duration } = useNarrationProgress();
  if (!duration) return null;
  return (
    <span className="shrink-0 tabular-nums">
      {formatTime(current)} / {formatTime(duration, Math.round)}
    </span>
  );
}

// A native range input (so it drags, clicks and takes arrow keys) laid invisibly over a
// drawn track, fill and thumb.
function SeekBar() {
  const { current, duration } = useNarrationProgress();
  const { seek } = useNarration();
  const percent = duration ? Math.min(100, (current / duration) * 100) : 0;
  return (
    <div className="relative h-5 min-w-0 flex-1">
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={1}
        value={current}
        disabled={!duration}
        onChange={(event) => seek(Number(event.target.value))}
        aria-label="Seek"
        aria-valuetext={`${formatTime(current)} of ${formatTime(duration, Math.round)}`}
        className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-default"
      />
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
      <span
        className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-primary"
        style={{ width: `${percent}%` }}
      />
      <span
        className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary shadow ring-2 ring-white dark:ring-[#0c0c1c] transition-transform peer-hover:scale-125 peer-active:scale-125 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-primary"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

// The small labelled on/off switches in the player (Auto, CC).
function PlayerToggle({
  on,
  onToggle,
  label,
  title,
  className = '',
  children,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      title={title}
      className={`shrink-0 rounded-full border px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider transition-colors ${
        on
          ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
          : 'border-slate-300 text-slate-500 hover:border-brand-primary hover:text-brand-primary dark:border-slate-600 dark:text-slate-400'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function SeekRow({ className = '' }: { className?: string }) {
  return (
    <div className={`items-center gap-2 font-mono text-[9px] text-slate-500 ${className}`}>
      <SeekBar />
      <TimeReadout />
    </div>
  );
}

const DESKTOP_REST_BOTTOM = 24;
const DESKTOP_CLEARANCE = 8;
/** Space kept between the shifted player and what it moved aside for. */
const DESKTOP_SIDE_GAP = 24;
/** The right rail and the chat bot below it: the player never slides into them. */
const DESKTOP_RIGHT_RESERVE = 104;

interface DesktopPlacement {
  bottom: number;
  shift: number;
}

const REST: DesktopPlacement = { bottom: DESKTOP_REST_BOTTOM, shift: 0 };

// Where the desktop player sits. It rests bottom-centre. When the hero buttons (marked
// data-voice-guide-clear) are under it, it slides right into the free space beside them,
// rising above them only when there's no room there. The footer text (marked
// data-voice-guide-clear="above") always sends it up, centred over the text. Overlap is judged on the marked element's children (the buttons themselves,
// not the full-width row around them). The footer mounts late, so this queries each time.
function useDesktopPlacement(wrapperRef: RefObject<HTMLDivElement | null>, contentKey: unknown) {
  const [placement, setPlacement] = useState(REST);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const apply = (next: DesktopPlacement) =>
      setPlacement((prev) => (prev.bottom === next.bottom && prev.shift === next.shift ? prev : next));

    const detect = () => {
      const box = wrapper.firstElementChild;
      if (!box || window.innerWidth < 1024) return apply(REST);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { width, height } = box.getBoundingClientRect();
      // The wrapper centres the box, so its resting span doesn't depend on any shift.
      const left = (vw - width) / 2;
      const right = left + width;
      const stripTop = vh - DESKTOP_REST_BOTTOM - height - DESKTOP_CLEARANCE;
      const stripBottom = vh - DESKTOP_REST_BOTTOM + DESKTOP_CLEARANCE;

      const parts = [...document.querySelectorAll<HTMLElement>('[data-voice-guide-clear]')]
        .flatMap((el) => {
          const above = el.dataset.voiceGuideClear === 'above';
          return (el.children.length ? [...el.children] : [el]).map((part) => ({ rect: part.getBoundingClientRect(), above }));
        })
        .filter(({ rect: r }) => r.width > 0 && r.top < stripBottom && r.bottom > stripTop);
      const blocking = parts.filter(({ rect: r }) => r.left < right + DESKTOP_CLEARANCE && r.right > left - DESKTOP_CLEARANCE);
      if (blocking.length === 0) return apply(REST);
      const lift = () =>
        apply({ bottom: Math.round(vh - Math.min(...blocking.map(({ rect }) => rect.top)) + DESKTOP_CLEARANCE), shift: 0 });

      // data-voice-guide-clear="above" (the footer) always lifts the player over it.
      if (blocking.some(({ above }) => above)) return lift();
      const shift = Math.ceil(Math.max(...parts.map(({ rect }) => rect.right)) + DESKTOP_SIDE_GAP - left);
      if (right + shift <= vw - DESKTOP_RIGHT_RESERVE) return apply({ bottom: DESKTOP_REST_BOTTOM, shift });
      lift();
    };

    detect();
    // The pill and the player differ in size, and captions change the player's height.
    const observer = new ResizeObserver(detect);
    observer.observe(wrapper);
    window.addEventListener('scroll', detect, { passive: true });
    window.addEventListener('resize', detect);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', detect);
      window.removeEventListener('resize', detect);
    };
  }, [wrapperRef, contentKey]);
  return placement;
}

// Floating voice-guide player. Idle, it is a single "Voice guide" pill that starts the
// auto-playing tour; once any clip is loaded it becomes one player box: live captions on
// top (switchable with CC), the controls, and the seek bar. It sits above the mobile
// bottom nav and bottom-centre on desktop, clear of both side rails, stepping aside (or,
// failing that, up) while it would cover the hero buttons or the footer text.
export function VoiceGuide({ interactiveReady }: { interactiveReady: boolean }) {
  const { currentId, status, autoPlay, startTour, togglePause, next, prev, stop, setAutoPlay } = useNarration();
  const [captions, setCaptions] = useState(true);
  const index = clipIndex(currentId);
  const clip = PLAYLIST[index];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const desktop = useDesktopPlacement(wrapperRef, Boolean(clip));

  // "New: listen to a guided tour" nudge (lib/hints), after the theme hint if that's due.
  const [hintDelay] = useState(() => (hintDue('theme') ? HINT_DELAY.voiceGuide : HINT_DELAY.voiceGuideAlone));
  const [showHint, closeHint] = useHint('voice-guide', hintDelay, interactiveReady && !clip);
  // Listening to any clip means the visitor has found the guide: no more hints.
  const playing = Boolean(clip);
  useEffect(() => {
    if (playing) completeHint('voice-guide');
  }, [playing]);

  if (PLAYLIST.length === 0) return null;

  const hasCaptions = Boolean(clip?.words.length);
  // Rendered twice: in the control row from sm up, beside the seek bar on phones (where
  // the control row has no room for it). The hidden copy is display:none.
  const autoToggle = (className: string) => (
    <PlayerToggle
      on={autoPlay}
      onToggle={() => setAutoPlay(!autoPlay)}
      label="Auto-play next section"
      title={autoPlay ? 'Auto-play on: continues to the next section' : 'Auto-play off: stops after this section'}
      className={className}
    >
      Auto
    </PlayerToggle>
  );

  return (
    <div
      ref={wrapperRef}
      style={{ '--voice-guide-bottom': `${desktop.bottom}px`, '--voice-guide-shift': `${desktop.shift}px` } as CSSProperties}
      className="fixed bottom-[88px] lg:bottom-[var(--voice-guide-bottom)] lg:translate-x-[var(--voice-guide-shift)] inset-x-3 z-40 flex justify-center pointer-events-none transition-[bottom,translate] duration-300 ease-out"
    >
      {!clip ? (
        <div className="pointer-events-auto relative">
          <AnimatePresence>
            {showHint && (
              <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center gap-2 whitespace-nowrap rounded-md bg-brand-primary px-3 py-2 font-mono text-[12px] text-white shadow-xl shadow-brand-primary/40"
                >
                  <Sparkles size={13} />
                  New: listen to a guided tour
                  <button
                    type="button"
                    onClick={closeHint}
                    aria-label="Dismiss"
                    className="-mr-1 ml-1 flex h-4 w-4 items-center justify-center rounded transition-colors hover:bg-white/20"
                  >
                    <X size={11} />
                  </button>
                  {/* Caret pointing down to the pill */}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-primary" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {showHint && <span className="pointer-events-none absolute inset-0 rounded-full border border-brand-primary/60 animate-ping" />}
          <button
            type="button"
            onClick={startTour}
            className="relative flex items-center gap-2 rounded-full border border-brand-primary/40 bg-white/80 dark:bg-[#0c0c1c]/80 backdrop-blur-xl px-4 py-2.5 font-mono text-xs text-brand-primary shadow-[0_8px_32px_-8px_rgba(2,12,27,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all"
          >
            <Headphones size={15} />
            Voice guide
          </button>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Voice guide player"
          className="pointer-events-auto flex w-full max-w-[440px] flex-col rounded-3xl border border-slate-200/80 dark:border-brand-primary/30 bg-white/90 dark:bg-[#0c0c1c]/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_8px_32px_-8px_rgba(2,12,27,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          {captions && hasCaptions && (
            <NarrationCaptions
              key={clip.id}
              words={clip.words}
              // Room for two lines (plus padding and border), so the player keeps a
              // steady height as one-line and two-line captions alternate.
              className="mx-1 mb-1.5 min-h-[calc(2lh+13px)] border-b border-slate-200/70 px-2 pb-2 pt-1 dark:border-white/10"
            />
          )}

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button type="button" onClick={prev} disabled={index === 0} aria-label="Previous section" className={controlClass}>
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              onClick={togglePause}
              aria-label={status === 'playing' ? 'Pause narration' : 'Play narration'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-[0_0_16px] shadow-brand-primary/45 hover:scale-105 transition-transform"
            >
              {status === 'loading' ? <Loader2 size={17} className="animate-spin" /> : status === 'playing' ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button type="button" onClick={next} disabled={index === PLAYLIST.length - 1} aria-label="Next section" className={controlClass}>
              <SkipForward size={16} />
            </button>

            <div className="min-w-0 flex-1 px-1.5 sm:px-2 leading-tight">
              <p className="truncate font-mono text-[9px] uppercase tracking-wider text-slate-500">
                <span className="hidden sm:inline">Voice guide · </span>
                {index + 1}/{PLAYLIST.length}
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" aria-live="polite">
                {clip.label}
              </p>
              <SeekRow className="hidden sm:flex" />
            </div>

            {/* Auto: when on, the guide moves on to the next section by itself. */}
            {autoToggle('hidden sm:block')}
            {hasCaptions && (
              <PlayerToggle
                on={captions}
                onToggle={() => setCaptions(!captions)}
                label="Captions"
                title={captions ? 'Hide captions' : 'Show captions'}
              >
                CC
              </PlayerToggle>
            )}
            <button type="button" onClick={stop} aria-label="Close voice guide" className={controlClass}>
              <X size={16} />
            </button>
          </div>

          {/* Phones: the seek bar gets its own full-width row, with Auto beside it. */}
          <div className="flex items-center gap-2 px-2 pt-1 sm:hidden">
            <SeekRow className="flex flex-1 min-w-0" />
            {autoToggle('')}
          </div>
        </div>
      )}
    </div>
  );
}
