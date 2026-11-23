import { useLayoutEffect, useRef, useState } from 'react';
import { reduce } from '../fx';
import { research as c } from '../content';
import { Rich, fill } from '../rich';

const D = c.chart.points;
const X = (v: number) => 50 + v * (570 / 60), Y = (v: number) => 212 - v * 48;
const TRACE = D.map(p => X(p[0]) + ',' + Y(p[1])).join(' ');
const BAND = D.map(p => X(p[0]) + ',' + Y(p[3])).concat(D.slice().reverse().map(p => X(p[0]) + ',' + Y(p[2]))).join(' ');
const GRID_Y = [260, 212, 164, 116, 68, 20];

/** Insider-cluster event study, drawn as a telemetry trace. */
export default function Research() {
  const [sel, setSel] = useState(c.chart.defaultDay);
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
        <h2>{c.title}</h2>
        <p><Rich text={c.intro} /></p>
      </div>
      <div className="research">
        <div className="scope">
          <div className="bar"><span>{c.chart.caption}</span><span className="live">{fill(c.chart.readout, { day: sel, value: selP[1].toFixed(2) })}</span></div>
          <svg viewBox="0 0 640 300" ref={scope} role="img" aria-label={c.chart.aria}>
            <g className="grid">{GRID_Y.map(y => <line key={y} x1="50" y1={y} x2="620" y2={y} />)}</g>
            {GRID_Y.map((y, i) => <text key={y} className="axis" x="40" y={y + 4} textAnchor="end">{c.chart.yAxis[i]}</text>)}
            <text className="axis" x="335" y="296" textAnchor="middle">{c.chart.xAxis}</text>
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
            {c.readouts.map(r => <div className="ro" key={r.u}><div className="n">{r.n}</div><div className="u">{r.u}</div></div>)}
          </div>
          <div className="notes">
            {c.notes.map(n => <p key={n}><Rich text={n} /></p>)}
          </div>
          <div className="cta"><a className="btn" href={c.link.href}>{c.link.label}</a></div>
        </div>
      </div>
      <div className="thread">
        <b>{c.thread.title}</b>
        <p><Rich text={c.thread.text} boldStyle={{ color: 'var(--chalk)' }} /></p>
      </div>
    </section>
  );
}
