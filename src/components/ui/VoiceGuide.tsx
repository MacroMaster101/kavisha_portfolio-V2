import { useState, type ReactNode } from 'react';
import { Headphones, Loader2, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
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

// Floating voice-guide player. Idle, it is a single "Voice guide" pill that starts the
// auto-playing tour; once any clip is loaded it becomes one player box: live captions on
// top (switchable with CC), the controls, and the seek bar. It sits above the mobile
// bottom nav and bottom-centre on desktop, clear of both side rails.
export function VoiceGuide() {
  const { currentId, status, autoPlay, startTour, togglePause, next, prev, stop, setAutoPlay } = useNarration();
  const [captions, setCaptions] = useState(true);
  const index = clipIndex(currentId);
  const clip = PLAYLIST[index];

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
    <div className="fixed bottom-[88px] lg:bottom-6 inset-x-3 z-40 flex justify-center pointer-events-none">
      {!clip ? (
        <button
          type="button"
          onClick={startTour}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-brand-primary/40 bg-white/80 dark:bg-[#0c0c1c]/80 backdrop-blur-xl px-4 py-2.5 font-mono text-xs text-brand-primary shadow-[0_8px_32px_-8px_rgba(2,12,27,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all"
        >
          <Headphones size={15} />
          Voice guide
        </button>
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
