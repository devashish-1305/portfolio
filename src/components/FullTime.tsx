import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { centerOf } from '../fx';
import { useGame } from '../game';

const EMAIL = 'devashish.dwivedi.13@gmail.com';

/** Final score, a recap of what the visitor did, and contact. */
export default function FullTime() {
  const { goals, stats, pop } = useGame();
  const [copyLabel, setCopyLabel] = useState('Copy my email');
  const resetTimer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async (e: MouseEvent<HTMLButtonElement>) => {
    const b = e.currentTarget;
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyLabel('Email copied');
      const [x, y] = centerOf(b); pop('SIGNED!', x, y - 80);
    } catch { setCopyLabel('Select the address below'); }
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyLabel('Copy my email'), 2200);
  };

  return (
    <section className="s ft" id="fulltime">
      <h2>Full time.</h2>
      <div className="final"><span>TALK</span><span className="score">0-{goals}</span><span>ACTION</span></div>
      <ul className="recap">
        <li className={stats.pass ? 'done' : undefined}>Played the pass</li>
        <li className={stats.race ? 'done' : undefined}>Started the race</li>
        <li className={stats.hl.size ? 'done' : undefined}>Opened <b>{stats.hl.size}</b> of 5 projects</li>
        <li className={stats.cards.size ? 'done' : undefined}>Flipped <b>{stats.cards.size}</b> of 6 cards</li>
      </ul>
      <p className="lead">You bring the idea. I'll play the pass.</p>
      <p className="sub">Open to AI builder, forward deployed engineer and AI solutions roles, where business meets tech. Gurugram, Delhi, Noida, Bengaluru or Mumbai. Available now.</p>
      <div className="cta">
        <button className="btn red" onClick={copy}>{copyLabel}</button>
        <a className="btn" href="https://linkedin.com/in/devashish-dwivedi">LinkedIn</a>
        <a className="btn" href="https://github.com/devashish-1305">GitHub</a>
      </div>
      <p className="email-line">Or write to <span>{EMAIL}</span></p>
    </section>
  );
}
