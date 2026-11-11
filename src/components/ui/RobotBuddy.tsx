import { useId } from 'react';

export type RobotPose = 'wave' | 'awake' | 'peek' | 'sleep';

// The chat assistant's full-body robot (ChatAssistant). One SVG whose parts are animated
// by CSS per pose (index.css, "Robot buddy"): it waves, idles awake, sleeps on its
// charging dock, and peeks one eye open when hovered while asleep. Outer groups hold the
// pose (and transition between poses); inner groups run the looping motion, so switching
// pose eases instead of snapping.
export function RobotBuddy({
  pose,
  thinking = false,
  className = '',
}: {
  pose: RobotPose;
  thinking?: boolean;
  className?: string;
}) {
  const id = useId();
  const shell = `${id}-shell`;
  const glow = `${id}-glow`;
  const chest = `${id}-chest`;
  return (
    <svg
      viewBox="0 0 64 80"
      aria-hidden="true"
      data-pose={pose}
      className={`robot ${thinking ? 'robot--thinking' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={shell} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="0.45" stopColor="#818cf8" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={chest}>
          <stop offset="0" stopColor="#ecfeff" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0891b2" />
        </radialGradient>
      </defs>

      <ellipse className="robot__shadow" cx="32" cy="77" rx="15" ry="2.6" fill="#0c0c1c" opacity="0.22" />

      <g className="robot__lean">
        <g className="robot__bob">
          {/* Legs: the pose group folds them when sitting; the inner group swings them. */}
          <g className="robot__legs">
            <g className="robot__leg robot__leg--l">
              <rect x="23.5" y="54" width="6.5" height="16" rx="3.25" fill="#6366f1" />
              <ellipse cx="26" cy="71" rx="5.4" ry="3.1" fill="#4f46e5" />
            </g>
            <g className="robot__leg robot__leg--r">
              <rect x="34" y="54" width="6.5" height="16" rx="3.25" fill="#6366f1" />
              <ellipse cx="38" cy="71" rx="5.4" ry="3.1" fill="#4f46e5" />
            </g>
          </g>

          <g className="robot__upper">
            {/* Arms */}
            <g className="robot__arm robot__arm--l">
              <rect x="11" y="38" width="6" height="15" rx="3" fill="#6366f1" />
              <circle cx="14" cy="54" r="3.4" fill="#a5b4fc" />
            </g>
            <g className="robot__arm robot__arm--r">
              <rect x="47" y="38" width="6" height="15" rx="3" fill="#6366f1" />
              <circle cx="50" cy="54" r="3.4" fill="#a5b4fc" />
            </g>

            {/* Torso + chest light (a charging pulse while asleep) */}
            <g className="robot__torso">
              <rect x="17" y="35" width="30" height="23" rx="10" fill={`url(#${shell})`} />
              <rect x="22" y="40" width="20" height="13" rx="6" fill="#0c0c1c" opacity="0.85" />
              <circle className="robot__core" cx="32" cy="46.5" r="3.6" fill={`url(#${chest})`} />
              <path d="M20 39 Q22 36.6 26 36.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>

            {/* Head */}
            <g className="robot__head">
              <g className="robot__head-bob">
                <line x1="32" y1="4.5" x2="32" y2="10.5" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" />
                <circle className="robot__halo" cx="32" cy="4" r="5" fill={`url(#${glow})`} />
                <circle className="robot__tip" cx="32" cy="4" r="2.4" fill="#67e8f9" />
                <rect x="8.5" y="18" width="4.5" height="10" rx="2" fill="#6366f1" />
                <rect x="51" y="18" width="4.5" height="10" rx="2" fill="#6366f1" />
                <rect x="11" y="10" width="42" height="27" rx="12" fill={`url(#${shell})`} />
                <rect x="15" y="14" width="34" height="18" rx="8.5" fill="#0c0c1c" />
                <g className="robot__eyes">
                  <rect className="robot__eye robot__eye--l" x="22" y="18.5" width="5.5" height="8" rx="2.75" fill="#67e8f9" />
                  <rect className="robot__eye robot__eye--r" x="36.5" y="18.5" width="5.5" height="8" rx="2.75" fill="#67e8f9" />
                </g>
                <ellipse className="robot__blush" cx="19.5" cy="28.5" rx="2.4" ry="1.2" fill="#f472b6" />
                <ellipse className="robot__blush" cx="44.5" cy="28.5" rx="2.4" ry="1.2" fill="#f472b6" />
                <path d="M15 15 Q17.5 11.8 22 11.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
