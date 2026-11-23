import { useState, type MouseEvent } from 'react';
import { pops, projects as c } from '../content';
import { Rich } from '../rich';
import { useGame } from '../game';

/** Projects accordion: each row opens into idea → pass → goal. */
export default function Projects() {
  const { first, pop } = useGame();
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (idx: number, e: MouseEvent<HTMLButtonElement>) => {
    const isOpen = !open.has(idx);
    setOpen(prev => { const n = new Set(prev); if (isOpen) n.add(idx); else n.delete(idx); return n; });
    if (isOpen && first('hl', idx)) {
      const r = e.currentTarget.getBoundingClientRect();
      pop(pops.project, e.clientX || r.right - 90, e.clientY || r.top + 30);
    }
  };

  return (
    <section className="s" id="highlights">
      <div className="s-head">
        <h2>{c.title}</h2>
        <p><Rich text={c.intro} /></p>
      </div>
      <div className="hl">
        {c.items.map((p, idx) => (
          <div key={p.title} className={`hl-row${open.has(idx) ? ' open' : ''}`}>
            <button className="hl-btn" aria-expanded={open.has(idx)} onClick={e => toggle(idx, e)}>
              <h3>{p.title}<small>{p.tag}</small></h3>
              <span className="what">{p.what}</span>
              <span className="stat"><span className="n">{p.stat}</span><span className="u">{p.unit}</span></span>
            </button>
            <div className="hl-detail"><div>
              <div className="ipg">
                <div><h5><i></i>{c.labels.idea}</h5><p><Rich text={p.idea} /></p></div>
                <div><h5><i></i>{c.labels.pass}</h5><p><Rich text={p.pass} /></p></div>
                <div><h5><i></i>{c.labels.goal}</h5><p><Rich text={p.goal} /></p></div>
              </div>
              {p.links && (
                <div className="hl-links">
                  {p.links.map(l => <a key={l.href} className={`btn${l.solid ? ' solid' : ''}`} href={l.href}>{l.label}</a>)}
                </div>
              )}
            </div></div>
          </div>
        ))}
      </div>
    </section>
  );
}
