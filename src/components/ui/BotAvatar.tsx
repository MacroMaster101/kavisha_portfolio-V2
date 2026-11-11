import { useId } from 'react';

// The chat assistant's face: a small robot head echoing the 3D robot in the hero. It
// floats and blinks while idle; while an answer is on its way its eyes scan side to side
// and the antenna pulses faster. Pure SVG + CSS (index.css, "Chat bot avatar"), so it
// costs no download and respects reduced motion with the rest of the site.
export function BotAvatar({ size = 40, thinking = false, className = '' }: { size?: number; thinking?: boolean; className?: string }) {
  const id = useId();
  const head = `${id}-head`;
  const glow = `${id}-glow`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={`bot-avatar ${thinking ? 'bot-avatar--thinking' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={head} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="bot-avatar__body">
        {/* Antenna */}
        <line x1="20" y1="5" x2="20" y2="10" stroke="#a5b4fc" strokeWidth="1.6" strokeLinecap="round" />
        <circle className="bot-avatar__halo" cx="20" cy="4" r="4" fill={`url(#${glow})`} />
        <circle className="bot-avatar__tip" cx="20" cy="4" r="1.9" fill="#67e8f9" />
        {/* Ears */}
        <rect x="3" y="17" width="3.5" height="8" rx="1.6" fill="#6366f1" />
        <rect x="33.5" y="17" width="3.5" height="8" rx="1.6" fill="#6366f1" />
        {/* Head and visor */}
        <rect x="6" y="10" width="28" height="22" rx="9" fill={`url(#${head})`} />
        <rect x="9.5" y="14" width="21" height="13" rx="6.5" fill="#0c0c1c" />
        {/* Eyes */}
        <g className="bot-avatar__eyes">
          <rect className="bot-avatar__eye" x="13.6" y="17.6" width="4" height="5.2" rx="2" fill="#67e8f9" />
          <rect className="bot-avatar__eye" x="22.4" y="17.6" width="4" height="5.2" rx="2" fill="#67e8f9" />
        </g>
        {/* Cheek shine */}
        <path d="M10 13.5 Q12 11.2 15.5 11" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
