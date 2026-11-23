import { useEffect, useRef, useState } from 'react';
import { burst, reduce } from '../fx';
import { useGame } from '../game';

const STEPS = [
  { x: 62, y: 350, t: 'Your idea', d: 'Someone has a problem, or half an idea of a fix.', cls: 'you', lx: 0, ly: 42 },
  { x: 170, y: 250, t: 'Listen', d: 'I sit with them until I can say the problem back in plain words.', cls: '', lx: -6, ly: -26 },
  { x: 300, y: 300, t: 'Translate', d: 'Turn it into a plan both the business and the engineers sign off on.', cls: '', lx: 0, ly: 44 },
  { x: 385, y: 170, t: 'Build', d: 'End to end: data, model, API and the screen someone clicks.', cls: '', lx: -10, ly: -26 },
  { x: 470, y: 250, t: 'Prove', d: 'Evals, tests and numbers before anyone has to trust it.', cls: '', lx: 12, ly: 44 },
  { x: 568, y: 80, t: 'Goal', d: 'It ships, and it still holds up once it’s live.', cls: 'goal', lx: -50, ly: 60 },
];

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
      if (live.current.first('pass')) live.current.pop('GOAL!', r.left + r.width * 0.85, r.top + r.height * 0.25, { big: true });
      else burst(r.left + r.width * 0.9, r.top + r.height * 0.2, 40);
    };

    const playPass = (user: boolean) => {
      if (playing.current) { if (user) wantUser.current = true; return; }
      wantUser.current = user; playing.current = true; light(0); setBall(STEPS[0].x, STEPS[0].y);
      if (reduce) { light(5); setBall(STEPS[5].x, STEPS[5].y); playing.current = false; if (user) finish(); return; }
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
    <section className="hero" aria-label="Summary">
      <div>
        <h1>I play the pass between the idea and the goal.</h1>
        <p className="sum"><strong>Devashish Dwivedi, 23, AI builder in Gurugram.</strong> Most problems stay problems because nobody passes them on properly. I sit between the business and the engineers, turn what people mean into AI systems that ship, and make sure they still work once they're live. Talk is cheap. I play the ball.</p>
        <div className="facts">
          <div>3.5 yrs<span>building ML and LLM systems</span></div>
          <div>3<span>production systems shipped at Benefi</span></div>
          <div>Now<span>available to join, no notice period</span></div>
        </div>
        <div className="cta"><a className="btn solid" href="#highlights">See the projects</a><a className="btn" href="#fulltime">Get in touch</a></div>
      </div>

      <div className="tele">
        <svg viewBox="0 0 600 420" ref={board} aria-label="How I work, as a pass from your idea to a shipped goal">
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
          <span className="step">{cap + 1}/6</span>
          <div><h4>{STEPS[cap].t}</h4><p>{STEPS[cap].d}</p></div>
          <button className="replay" onClick={() => playRef.current(true)}>Play the pass</button>
        </div>
      </div>
    </section>
  );
}
