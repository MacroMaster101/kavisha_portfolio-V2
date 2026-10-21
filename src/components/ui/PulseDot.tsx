// Green "available" status dot with a ping ring (Hero, About, Experience).
// `className` sets its size, e.g. "h-2 w-2".
export function PulseDot({ className }: { className: string }) {
  return (
    <span className={`relative flex ${className}`}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
      <span className={`relative inline-flex rounded-full bg-green-500 ${className}`} />
    </span>
  );
}
