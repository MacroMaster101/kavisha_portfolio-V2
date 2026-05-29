// Orbital backdrop behind the hero robot. A soft brand-tinted glow, tilted
// elliptical orbit rings with glowing dots traveling along them, and a few
// twinkling stars. Everything is brand-colored and edge-faded so it blends into
// the page background (no panel/frame) and matches both light and dark themes.

// Orbit ring definitions: rx/ry are ellipse radii in a 0-200 viewBox centered at
// (100,100); rotate tilts the ellipse; duration is how long a dot takes to circle it.
const orbits = [
  { rx: 82, ry: 44, rotate: -18, duration: 18, nodeColor: '#a855f7', delay: 0 },
  { rx: 60, ry: 74, rotate: 22, duration: 24, nodeColor: '#6366f1', delay: 2 },
  { rx: 90, ry: 60, rotate: 8, duration: 30, nodeColor: '#818cf8', delay: 4 },
];

// Static twinkling stars (percent positions).
const stars = [
  { x: 14, y: 22, s: 2 }, { x: 82, y: 16, s: 1.5 }, { x: 70, y: 76, s: 2 },
  { x: 24, y: 70, s: 1.5 }, { x: 90, y: 48, s: 1 }, { x: 8, y: 52, s: 1 },
  { x: 50, y: 10, s: 1.5 }, { x: 60, y: 90, s: 1 }, { x: 36, y: 40, s: 1 },
];

export function RobotBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none [--robot-glow-a:rgba(99,102,241,0.12)] [--robot-glow-b:rgba(168,85,247,0.05)] dark:[--robot-glow-a:rgba(99,102,241,0.20)] dark:[--robot-glow-b:rgba(168,85,247,0.08)]"
      aria-hidden
    >
      {/* Soft circular brand glow. Default circle sizing (farthest-corner) with the
          transparent stop pulled inward to ~52% keeps it a clean round glow that fades
          well before any edge — no rectangular edges, and no `closest-side` keyword
          (which trips a PostCSS gradient-syntax warning). */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 48%, var(--robot-glow-a), var(--robot-glow-b) 32%, transparent 52%)',
        }}
      />

      {/* Twinkling stars — brand-tinted so they read on light backgrounds too. */}
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-brand-primary/50 dark:bg-slate-100/80 animate-pulse"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            animationDuration: `${3 + (i % 3)}s`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Orbit rings + traveling dots. Kept lightly masked at the very edges only,
          so the elliptical lines stay clearly visible around the robot. */}
      <svg
        className="absolute inset-0 w-full h-full [mask-image:radial-gradient(circle_at_center,#000_85%,transparent_100%)]"
        viewBox="0 0 200 200"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {orbits.map((o, i) => {
          // Ellipse as a path so a dot can travel it via <animateMotion>.
          const ellipsePath = `M ${100 - o.rx} 100 a ${o.rx} ${o.ry} 0 1 0 ${o.rx * 2} 0 a ${o.rx} ${o.ry} 0 1 0 ${-o.rx * 2} 0`;
          return (
            <g key={i} transform={`rotate(${o.rotate} 100 100)`}>
              <path d={ellipsePath} stroke={o.nodeColor} strokeWidth="0.7" opacity="0.55" fill="none" />
              <circle r="3" fill={o.nodeColor} style={{ filter: `drop-shadow(0 0 6px ${o.nodeColor})` }}>
                <animateMotion dur={`${o.duration}s`} begin={`${o.delay}s`} repeatCount="indefinite" path={ellipsePath} />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
