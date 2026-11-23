import { useEffect, useRef, useState } from 'react';
import { reduce } from '../fx';
import { useGame } from '../game';

/** Fixed header: crest, nav and the TALK 0-N ACTION LED scoreboard with a running match clock. */
export default function Scoreboard() {
  const { goals } = useGame();
  const led = useRef<HTMLDivElement>(null);
  const [secs, setSecs] = useState(23 * 60);

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
      <a className="crest" href="#top" aria-label="Back to the top"><i>8</i>Devashish</a>
      <nav className="nav" aria-label="Sections">
        <a href="#career">Career</a><a href="#highlights">Projects</a><a href="#research">Research</a><a href="#how">How I play</a><a href="#off">Off the clock</a><a href="#fulltime">Contact</a>
      </nav>
      <div className="led" ref={led} title="Talk is cheap. Everything you do on this page counts as action.">
        <span>TALK</span><span className="score" role="status" aria-live="polite" aria-label="Score">0-{goals}</span><span>ACTION</span>
        <span className="clock" title="Twenty-three and already on the scoresheet">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      </div>
    </header>
  );
}
