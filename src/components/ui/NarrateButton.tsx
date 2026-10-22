import { Loader2, Pause, Volume2 } from 'lucide-react';
import { useNarration } from '../../contexts/useNarration';
import { hasClip } from '../../lib/narrationClips';

// Three bars that bounce while the clip plays and rest while it is paused.
function SoundBars({ moving }: { moving: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className={`h-full w-[3px] origin-bottom rounded-full bg-brand-primary ${
            moving ? 'animate-[narration-bar_0.9s_ease-in-out_infinite]' : 'scale-y-[0.35]'
          }`}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

// Per-section "listen" button. Plays that section's voice-guide clip, and turns into a
// pause/resume control while its own clip is the one loaded. While it is, a "Now
// narrating" badge (just the bars on phones) marks the section being read.
export function NarrateButton({ id, name }: { id: string; name: string }) {
  const { currentId, status, toggleSection } = useNarration();
  const active = currentId === id;
  const playing = active && status === 'playing';
  const loading = active && status === 'loading';

  if (!hasClip(id)) return null;

  return (
    <span className="flex shrink-0 items-center gap-2">
      {active && (
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brand-primary">
          <SoundBars moving={playing} />
          <span className="hidden sm:inline">{playing || loading ? 'Now narrating' : 'Paused'}</span>
        </span>
      )}
      <button
        type="button"
        onClick={() => toggleSection(id)}
        aria-label={playing ? `Pause narration of ${name}` : `Listen to ${name}`}
        title={playing ? 'Pause narration' : 'Listen to this section'}
        className={`relative shrink-0 flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 ${
          active
            ? 'border-brand-primary bg-brand-primary text-white shadow-[0_0_16px] shadow-brand-primary/45'
            : 'border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10'
        }`}
      >
        {playing && <span className="absolute inset-0 rounded-full border border-brand-primary/60 animate-ping" />}
        {loading ? <Loader2 size={16} className="animate-spin" /> : playing ? <Pause size={16} /> : <Volume2 size={16} />}
      </button>
    </span>
  );
}
