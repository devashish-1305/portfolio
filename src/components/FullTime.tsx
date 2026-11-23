import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { fullTime as c, header, offTheClock, pops, projects, site } from '../content';
import { centerOf } from '../fx';
import { useGame } from '../game';
import { fill } from '../rich';

/** Final score, a recap of what the visitor did, and contact. */
export default function FullTime() {
  const { goals, stats, pop } = useGame();
  const [copyLabel, setCopyLabel] = useState(c.copyEmail);
  const resetTimer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async (e: MouseEvent<HTMLButtonElement>) => {
    const b = e.currentTarget;
    try {
      await navigator.clipboard.writeText(site.email);
      setCopyLabel(c.copied);
      const [x, y] = centerOf(b); pop(pops.emailCopied, x, y - 80);
    } catch { setCopyLabel(c.copyFailed); }
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyLabel(c.copyEmail), 2200);
  };

  return (
    <section className="s ft" id="fulltime">
      <h2>{c.title}</h2>
      <div className="final"><span>{header.scoreboard.left}</span><span className="score">0-{goals}</span><span>{header.scoreboard.right}</span></div>
      <ul className="recap">
        <li className={stats.pass ? 'done' : undefined}>{c.recap.pass}</li>
        <li className={stats.race ? 'done' : undefined}>{c.recap.race}</li>
        <li className={stats.hl.size ? 'done' : undefined}>{fill(c.recap.hl, { n: <b>{stats.hl.size}</b>, total: projects.items.length })}</li>
        <li className={stats.cards.size ? 'done' : undefined}>{fill(c.recap.cards, { n: <b>{stats.cards.size}</b>, total: offTheClock.cards.length })}</li>
      </ul>
      <p className="lead">{c.lead}</p>
      <p className="sub">{c.sub}</p>
      <div className="cta">
        <button className="btn red" onClick={copy}>{copyLabel}</button>
        <a className="btn" href={site.links.linkedin.href}>{site.links.linkedin.label}</a>
        <a className="btn" href={site.links.github.href}>{site.links.github.label}</a>
      </div>
      <p className="email-line">{c.emailLine} <span>{site.email}</span></p>
    </section>
  );
}
