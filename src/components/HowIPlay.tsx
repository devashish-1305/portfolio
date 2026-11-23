import { howIPlay as c } from '../content';
import { Rich } from '../rich';

/** Working style in three phases, plus the signature move on the chalkboard. */
export default function HowIPlay() {
  return (
    <section className="s" id="how">
      <div className="s-head">
        <h2>{c.title}</h2>
        <p><Rich text={c.intro} /></p>
      </div>
      <div className="phases">
        {c.phases.map(p => (
          <div className="phase" key={p.title}><div className="k">{p.k}</div><h3>{p.title}</h3><p>{p.text}</p><p className="kit">{p.kit}</p></div>
        ))}
      </div>
      <div className="chalk">
        <blockquote>{c.quote}</blockquote>
        <div className="move">
          <p><Rich text={c.move} /></p>
          <div className="stat"><span className="n">{c.stat.n}</span><span className="u">{c.stat.u}</span></div>
        </div>
      </div>
    </section>
  );
}
