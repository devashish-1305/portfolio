import { easterEggHint as h } from '../content';
import { fill } from '../rich';

/** "Psst. Type messi or max…" with the codes as keyboard keys. Hidden by CSS on touch / coarse-pointer devices. */
export default function EggHint({ className = '' }: { className?: string }) {
  return (
    <p className={`egg-hint ${className}`.trim()}>
      {fill(h.text, Object.fromEntries(Object.entries(h.keys).map(([k, v]) => [k, <kbd key={k}>{v}</kbd>])))}
    </p>
  );
}
