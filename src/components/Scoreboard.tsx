import { useEffect, useRef, useState } from 'react';
import { header } from '../content';
import { reduce } from '../fx';
import { useGame } from '../game';

/** Fixed header: crest, nav and the TALK 0-N ACTION LED scoreboard with a running match clock. */
export default function Scoreboard() {
  const { goals } = useGame();
  const led = useRef<HTMLDivElement>(null);
  const sb = header.scoreboard;
  const [secs, setSecs] = useState(sb.clockStartMinutes * 60);

  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const el = led.current;
    if (!goals || !el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }, [goals]);

  return (
    <header className="board">
      <a className="crest" href="#top" aria-label={header.crestAria}><i>{header.crestNumber}</i>{header.crestName}</a>
      <nav className="nav" aria-label={header.navAria}>
        {header.nav.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
      </nav>
      <div className="led" ref={led} title={sb.title}>
        <span>{sb.left}</span><span className="score" role="status" aria-live="polite" aria-label={sb.scoreAria}>0-{goals}</span><span>{sb.right}</span>
        <span className="clock" title={sb.clockTitle}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      </div>
    </header>
  );
}
