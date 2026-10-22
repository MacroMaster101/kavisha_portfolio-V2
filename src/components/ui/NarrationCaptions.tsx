import { useEffect, useMemo, useState } from 'react';
import { useNarration, useNarrationProgress } from '../../contexts/useNarration';
import { wordAt, type CaptionWord } from '../../lib/narrationClips';

// [first, last] word index of each caption line, subtitle-style: a line ends at a
// sentence end, at a comma/semicolon once it has a few words, or at 14 words at most —
// so a caption stays about two lines tall on a phone.
const MIN_WORDS_BEFORE_PAUSE = 6;
const MAX_WORDS = 14;

function captionLines(words: CaptionWord[]) {
  const ranges: [number, number][] = [];
  let start = 0;
  words.forEach(([text], i) => {
    const length = i - start + 1;
    const sentenceEnd = /[.!?]["')]?$/.test(text);
    const pause = /[,;:]$/.test(text) && length >= MIN_WORDS_BEFORE_PAUSE;
    if (sentenceEnd || pause || length >= MAX_WORDS || i === words.length - 1) {
      ranges.push([start, i]);
      start = i + 1;
    }
  });
  return ranges;
}

// Live captions inside the voice-guide player: the line being spoken, with the current
// word highlighted. Hidden from screen readers, which already hear the audio.
export function NarrationCaptions({ words, className = '' }: { words: CaptionWord[]; className?: string }) {
  const { status, getTime } = useNarration();
  const { current } = useNarrationProgress();
  const ranges = useMemo(() => captionLines(words), [words]);
  const [liveIndex, setLiveIndex] = useState(-1);

  // While playing, follow the audio every frame: timeupdate (~4 per second) is too coarse
  // to keep up with speech. React skips the re-render when the word hasn't changed.
  useEffect(() => {
    if (status !== 'playing') return;
    let frame = requestAnimationFrame(function tick() {
      setLiveIndex(wordAt(words, getTime()));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [status, words, getTime]);

  if (words.length === 0) return null;

  // Paused or seeking: the progress position is exact enough.
  const index = status === 'playing' ? liveIndex : wordAt(words, current);
  const [first, last] = ranges.find(([, end]) => index <= end) ?? ranges[0];

  return (
    <p
      aria-hidden="true"
      className={`text-[13px] leading-relaxed text-slate-400 dark:text-slate-500 ${className}`}
    >
      {words.slice(first, last + 1).map(([text], offset) => {
        const i = first + offset;
        return (
          <span key={i}>
            {/* The highlight's padding is a ring, not real padding, so words never shift. */}
            <span
              className={`rounded-sm transition-colors duration-150 ${
                i === index
                  ? 'bg-brand-primary text-white shadow-[0_0_0_2px_var(--brand-primary)]'
                  : i < index
                    ? 'text-slate-800 dark:text-slate-200'
                    : ''
              }`}
            >
              {text}
            </span>{' '}
          </span>
        );
      })}
    </p>
  );
}
