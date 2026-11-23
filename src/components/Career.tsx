import { useEffect, useRef, useState } from 'react';
import { burst, reduce } from '../fx';
import { useGame } from '../game';
import { career as c, pops } from '../content';
import { Rich } from '../rich';

// Track gates sit evenly from 24% to 89% of the track, one per lap.
const GATES = c.laps.map((l, i) => ({ left: `${24 + i * 13}%`, label: l.gate }));

/** Career timeline as a race: five lights, lights out, the car drives through each year's gate. */
export default function Career() {
  const game = useGame();
  const live = useRef(game);
  live.current = game;

  const [lightsOn, setLightsOn] = useState(0);
  const [passed, setPassed] = useState(0); // number of gates the car has passed
  const [racing, setRacing] = useState(false);
  const racingRef = useRef(false);
  const car = useRef<HTMLButtonElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const gateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(() => alive.current && fn(), ms)); };

  const setRace = (v: boolean) => { racingRef.current = v; setRacing(v); };

  const drive = () => {
    setRace(true);
    const c = car.current!, t = track.current!;
    const start = c.offsetLeft, dist = t.clientWidth + 40 - start, ms = reduce ? 1 : 2200, t0 = performance.now(), tr = t.getBoundingClientRect();
    let last = 0, gatesPassed = 0;
    const step = (now: number) => {
      if (!alive.current) return;
      const k = Math.min(1, (now - t0) / ms), x = dist * Math.pow(k, 2.1), carX = start + x;
      c.style.transform = `translate(${x}px,-50%)`;
      while (gatesPassed < GATES.length && carX + c.offsetWidth * 0.85 > gateRefs.current[gatesPassed]!.offsetLeft) gatesPassed++;
      setPassed(gatesPassed);
      if (!reduce && now - last > 28 && k < 0.92) {
        last = now;
        const p = document.createElement('div'); p.className = 'puff'; const s = 26 + Math.random() * 26 + (1 - k) * 30;
        p.style.width = p.style.height = s + 'px'; p.style.left = carX + 18 + 'px'; p.style.top = t.clientHeight / 2 + 16 + (Math.random() - 0.5) * 16 + 'px';
        t.appendChild(p); setTimeout(() => p.remove(), 1450);
      }
      if (k < 1) requestAnimationFrame(step);
      else {
        if (live.current.first('race')) live.current.pop(pops.race, tr.right - 140, tr.top + tr.height / 2, { p1: true });
        else burst(tr.right - 140, tr.top + tr.height / 2, 30);
        later(() => {
          c.style.transition = 'none'; c.style.transform = 'translate(0,-50%)'; c.style.opacity = '0';
          requestAnimationFrame(() => { c.style.transition = 'opacity .5s'; c.style.opacity = '1'; });
          setRace(false);
        }, 900);
      }
    };
    step(t0);
  };

  const launch = () => {
    if (racingRef.current) return;
    setRace(true); setPassed(0);
    let i = 0;
    const iv = window.setInterval(() => {
      if (!alive.current) return clearInterval(iv);
      if (i < 5) { setLightsOn(++i); return; }
      clearInterval(iv);
      later(() => { setLightsOn(0); drive(); }, reduce ? 0 : 400 + Math.random() * 600);
    }, reduce ? 1 : 480);
  };

  // Expose launch to the "max" easter egg.
  const launchRef = useRef(launch);
  launchRef.current = launch;
  useEffect(() => {
    alive.current = true;
    game.race.current = () => launchRef.current();
    return () => { alive.current = false; timers.current.forEach(clearTimeout); game.race.current = null; };
  }, [game.race]);

  return (
    <section className="s" id="career">
      <div className="s-head">
        <h2>{c.title}</h2>
        <p><Rich text={c.intro} /></p>
      </div>
      <div className="gantry">
        <div className="lights" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <span key={i} className={i < lightsOn ? 'on' : undefined} />)}</div>
        <button className="go" onClick={launch} disabled={racing}>{c.go}</button>
        <p>{c.orClick}</p>
      </div>
      <div className="track" ref={track}>
        <div className="lane" /><div className="grid-box" />
        {GATES.map((g, i) => (
          <div key={i} className={`gate${i < passed ? ' passed' : ''}`} style={{ left: g.left }} ref={el => { gateRefs.current[i] = el; }}><b>{g.label}</b></div>
        ))}
        <button className="car" ref={car} aria-label={c.carAria} onClick={() => { if (!racingRef.current) { setPassed(0); drive(); } }}>
          <svg viewBox="0 0 240 72" aria-hidden="true">
            <rect x="4" y="10" width="32" height="7" rx="1.5" fill="#13306E" /><rect x="8" y="10" width="6" height="30" fill="#0d2152" />
            <path d="M12 50 L12 38 Q36 31 66 29 L92 23 Q108 17 124 25 L150 32 Q190 37 226 45 L230 50 Z" fill="#13306E" />
            <path d="M26 44 L206 44 L218 48 L26 49 Z" fill="#B3123F" />
            <path d="M92 23 Q108 17 124 25 L118 27 Q106 22 96 26 Z" fill="#FFB627" />
            <circle cx="111" cy="20" r="8.5" fill="#FFB627" /><path d="M104 19 Q111 14 118 19 L118 22 L104 22 Z" fill="#101418" />
            <path d="M101 16 Q113 6 131 24" fill="none" stroke="#0a0f14" strokeWidth="3.2" strokeLinecap="round" />
            <text x="58" y="42" fontFamily="Big Shoulders Display, sans-serif" fontWeight="900" fontSize="15" fill="#EEF2E6">{c.carNumber}</text>
            <rect x="210" y="49" width="28" height="4" rx="1" fill="#B3123F" /><rect x="233" y="42" width="4" height="12" fill="#13306E" />
            <circle cx="46" cy="53" r="15" fill="#0b0b0b" stroke="#2c2c2c" strokeWidth="3" /><circle cx="46" cy="53" r="5.5" fill="#3b3b3b" />
            <circle cx="192" cy="54" r="13" fill="#0b0b0b" stroke="#2c2c2c" strokeWidth="3" /><circle cx="192" cy="54" r="4.8" fill="#3b3b3b" />
          </svg>
        </button>
      </div>
      <div className="laps">
        {c.laps.map((l, i) => (
          <div key={i} className={`lap${l.now ? ' now' : ''}${i < passed ? ' passed' : ''}`}>
            <div className="yr">{l.yr}</div><h4>{l.co}</h4><div className="role">{l.role}</div><div className="num"><Rich text={l.detail} bold="b" /></div>
          </div>
        ))}
      </div>

      <div className="feature">
        <div>
          <h3>{c.feature.title}</h3>
          <div className="meta">{c.feature.meta.map(m => <p key={m}>{m}</p>)}</div>
        </div>
        <div className="wins">
          {c.feature.wins.map(w => <div className="win" key={w.title}><div className="n">{w.n}</div><h4>{w.title}</h4><p>{w.text}</p></div>)}
        </div>
      </div>
      <p className="also"><Rich text={c.also} /></p>
    </section>
  );
}

