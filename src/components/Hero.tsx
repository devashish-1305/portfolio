import { useEffect, useRef, useState } from 'react';
import { burst, reduce } from '../fx';
import { useGame } from '../game';
import { hero, pops } from '../content';
import { Rich } from '../rich';
import ResumeButton from './ResumeButton';

const STEPS = hero.pass.steps;
const LAST = STEPS.length - 1;

// Curved segments between the nodes, alternating sides.
const SEG_D: string[] = [];
let ROUTE_D = `M${STEPS[0].x} ${STEPS[0].y}`;
for (let i = 1; i < STEPS.length; i++) {
  const a = STEPS[i - 1], b = STEPS[i], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), s = i % 2 ? -1 : 1;
  const c = { x: mx - (dy / len) * 36 * s, y: my + (dx / len) * 36 * s };
  ROUTE_D += ` Q${c.x} ${c.y} ${b.x} ${b.y}`;
  SEG_D.push(`M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`);
}

/** Summary + "the pass": a ball travelling idea → goal across a tactics board. */
export default function Hero() {
  const { first, pop } = useGame();
  const [lit, setLit] = useState(0);
  const [cap, setCap] = useState(0);
  const board = useRef<SVGSVGElement>(null);
  const route = useRef<SVGPathElement>(null);
  const ball = useRef<SVGUseElement>(null);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const playing = useRef(false);
  const wantUser = useRef(false);
  const playRef = useRef<(user: boolean) => void>(() => {});

  const setBall = (x: number, y: number, r = 0) => ball.current?.setAttribute('transform', `translate(${x} ${y}) rotate(${r})`);
  const light = (upTo: number) => { setLit(upTo); setCap(upTo); };

  // Latest stats/pop without re-creating the animation loop.
  const live = useRef({ first, pop });
  live.current = { first, pop };

  useEffect(() => {
    let alive = true;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(() => alive && fn(), ms)); };

    const finish = () => {
      const r = board.current!.getBoundingClientRect();
      if (live.current.first('pass')) live.current.pop(pops.pass, r.left + r.width * 0.85, r.top + r.height * 0.25, { big: true });
      else burst(r.left + r.width * 0.9, r.top + r.height * 0.2, 40);
    };

    const playPass = (user: boolean) => {
      if (playing.current) { if (user) wantUser.current = true; return; }
      wantUser.current = user; playing.current = true; light(0); setBall(STEPS[0].x, STEPS[0].y);
      if (reduce) { light(LAST); setBall(STEPS[LAST].x, STEPS[LAST].y); playing.current = false; if (user) finish(); return; }
      let i = 0;
      const next = () => {
        if (i >= SEG_D.length) { playing.current = false; if (wantUser.current) finish(); return; }
        const seg = segRefs.current[i]!, L = seg.getTotalLength(), ms = 560, t0 = performance.now();
        const step = (now: number) => {
          if (!alive) return;
          const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = seg.getPointAtLength(L * e);
          setBall(p.x, p.y, (i + e) * 260);
          if (k < 1) requestAnimationFrame(step);
          else { i++; light(i); later(next, wantUser.current ? 380 : 520); }
        };
        step(t0);
      };
      later(next, 250);
    };
    playRef.current = playPass;

    setBall(STEPS[0].x, STEPS[0].y);
    if (!reduce) {
      later(() => playPass(false), 700);
      const r = route.current!, L = r.getTotalLength();
      r.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'ease-out' });
    }
    return () => { alive = false; timers.forEach(clearTimeout); playing.current = false; };
  }, []);

  const pick = (i: number) => { if (playing.current) return; setBall(STEPS[i].x, STEPS[i].y); light(i); };

  return (
    <section className="hero" aria-label={hero.aria}>
      <div>
        <h1>{hero.title}</h1>
        <p className="sum"><Rich text={hero.summary} /></p>
        <div className="facts">
          {hero.facts.map(f => <div key={f.label}>{f.value}<span>{f.label}</span></div>)}
        </div>
        <div className="cta"><a className="btn solid" href={hero.cta.primary.href}>{hero.cta.primary.label}</a><a className="btn" href={hero.cta.secondary.href}>{hero.cta.secondary.label}</a><ResumeButton label={hero.cta.resume} /></div>
      </div>

      <div className="tele">
        <svg viewBox="0 0 600 420" ref={board} aria-label={hero.pass.aria}>
          <g className="deco" aria-hidden="true">
            <path d="M0 210 H600" /><circle cx="300" cy="210" r="70" />
            <rect x="470" y="40" width="130" height="150" />
          </g>
          <g aria-hidden="true">
            <rect className="goalframe" x="548" y="48" width="40" height="64" rx="2" />
            <path className="goalnet" d="M556 48V112M564 48V112M572 48V112M580 48V112M548 60H588M548 72H588M548 84H588M548 96H588" />
          </g>
          <path className="route" ref={route} d={ROUTE_D} />
          <g aria-hidden="true" fill="none">
            {SEG_D.map((d, i) => <path key={i} d={d} ref={el => { segRefs.current[i] = el; }} />)}
          </g>
          <g>
            {STEPS.map((s, i) => (
              <g key={s.t} className={`node ${s.cls}${i <= lit ? ' lit' : ''}`} tabIndex={0} role="button" aria-label={`${s.t}: ${s.d}`}
                onClick={() => pick(i)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }}
                onMouseEnter={() => { if (!playing.current) setCap(i); }}>
                <circle cx={s.x} cy={s.y} r={13} />
                <text x={s.x + s.lx} y={s.y + s.ly} textAnchor="middle">{s.t}</text>
              </g>
            ))}
          </g>
          <use href="#ball" ref={ball} width="26" height="26" x="-13" y="-13" />
        </svg>
        <div className="caption" aria-live="polite">
          <span className="step">{cap + 1}/{STEPS.length}</span>
          <div><h4>{STEPS[cap].t}</h4><p>{STEPS[cap].d}</p></div>
          <button className="replay" onClick={() => playRef.current(true)}>{hero.pass.replay}</button>
        </div>
      </div>
    </section>
  );
}
