import { useLayoutEffect, useRef, useState } from 'react';
import { reduce } from '../fx';

// [trading day, mean CAR %, CI low, CI high]
const D: [number, number, number, number][] = [[0, 0, 0, 0], [1, 1.22, 0.98, 1.46], [5, 1.47, 1.15, 1.79], [30, 1.65, 1.05, 2.25], [60, 3.23, 2.18, 4.28]];
const X = (v: number) => 50 + v * (570 / 60), Y = (v: number) => 212 - v * 48;
const TRACE = D.map(p => X(p[0]) + ',' + Y(p[1])).join(' ');
const BAND = D.map(p => X(p[0]) + ',' + Y(p[3])).concat(D.slice().reverse().map(p => X(p[0]) + ',' + Y(p[2]))).join(' ');
const GRID_Y = [260, 212, 164, 116, 68, 20];
const AXIS = ['-1%', '0%', '1%', '2%', '3%', '4%'];

/** Insider-cluster event study, drawn as a telemetry trace. */
export default function Research() {
  const [sel, setSel] = useState(30);
  const scope = useRef<SVGSVGElement>(null);
  const trace = useRef<SVGPolylineElement>(null);
  const band = useRef<SVGPolygonElement>(null);
  const selP = D.find(p => p[0] === sel)!;

  useLayoutEffect(() => {
    if (reduce || !('IntersectionObserver' in window)) return;
    const t = trace.current!, b = band.current!, L = t.getTotalLength();
    t.style.strokeDasharray = String(L); t.style.strokeDashoffset = String(L); b.style.opacity = '0';
    const ob = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      ob.disconnect();
      t.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1600, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
      b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 1100, fill: 'forwards' });
    }, { threshold: 0.5 });
    ob.observe(scope.current!);
    return () => ob.disconnect();
  }, []);

  return (
    <section className="s" id="research">
      <div className="s-head">
        <h2>Research</h2>
        <p>F1 teams win on telemetry: decide what to measure, then trust the data. I ran my own quant study the same way. <strong>When three or more company insiders buy their own stock within 30 days, does the price follow?</strong></p>
      </div>
      <div className="research">
        <div className="scope">
          <div className="bar"><span>Extra return over the market after an insider cluster, with 95% confidence band</span><span className="live">DAY {sel}: +{selP[1].toFixed(2)}%</span></div>
          <svg viewBox="0 0 640 300" ref={scope} role="img" aria-label="Mean cumulative abnormal return rises to 1.22% after one day, 1.65% after 30 trading days and 3.23% after 60.">
            <g className="grid">{GRID_Y.map(y => <line key={y} x1="50" y1={y} x2="620" y2={y} />)}</g>
            {GRID_Y.map((y, i) => <text key={y} className="axis" x="40" y={y + 4} textAnchor="end">{AXIS[i]}</text>)}
            <text className="axis" x="335" y="296" textAnchor="middle">Trading days after the cluster</text>
            <line className="zero" x1="50" y1="212" x2="620" y2="212" />
            <polygon className="band" ref={band} points={BAND} /><polyline className="trace" ref={trace} points={TRACE} />
            <g>
              {D.map(p => (
                <g key={p[0]}>
                  <text className="axis" x={X(p[0]) + (p[0] === 1 ? 6 : p[0] === 0 ? -4 : 0)} y={280} textAnchor="middle">{p[0]}</text>
                  {p[0] !== 0 && (
                    <circle className={`pt${p[0] === sel ? ' sel' : ''}`} cx={X(p[0])} cy={Y(p[1])} r={7} tabIndex={0}
                      onMouseEnter={() => setSel(p[0])} onFocus={() => setSel(p[0])} onClick={() => setSel(p[0])} />
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
        <div>
          <div className="readouts">
            <div className="ro"><div className="n">+1.65%</div><div className="u">average extra return over 30 trading days</div></div>
            <div className="ro"><div className="n">5.42</div><div className="u">t-statistic, p &lt; 1e-7</div></div>
            <div className="ro"><div className="n">2,664</div><div className="u">insider clusters, US stocks 2015–2024</div></div>
            <div className="ro"><div className="n">1,030</div><div className="u">companies in the sample</div></div>
          </div>
          <div className="notes">
            <p><strong>Pre-registered.</strong> The signal, filters and tests were fixed before I saw a single result, so the finding couldn't be shaped afterwards.</p>
            <p>It holds under risk adjustment, other cluster definitions and both halves of the decade. It's observational, not causal, and trading costs aren't modelled yet.</p>
          </div>
          <div className="cta"><a className="btn" href="https://github.com/devashish-1305/insider-cluster-alpha">Read the paper and code</a></div>
        </div>
      </div>
      <div className="thread">
        <b>Why it's here</b>
        <p>It's the same habit behind <a href="#highlights">deal-radar and repo2bench</a>: decide the test before you see the result, then report what the data says, even when it's boring. Next up is <strong style={{ color: 'var(--chalk)' }}>Alphatrace</strong>, a research system that logs every hypothesis tested, not just the ones that worked.</p>
      </div>
    </section>
  );
}
