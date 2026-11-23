import { useState, type MouseEvent, type ReactNode } from 'react';
import { useGame } from '../game';

type Project = {
  title: string; tag: string; what: string; stat: string; unit: string;
  idea: ReactNode; pass: ReactNode; goal: ReactNode;
  links?: { label: string; href: string; solid?: boolean }[];
};

const PROJECTS: Project[] = [
  {
    title: 'Invoice decision agent', tag: 'Finance operations, live demo',
    what: 'Reads Indian GST invoices and decides approve, hold or reject, with the evidence behind it.',
    stat: '~8s', unit: 'per invoice, end to end',
    idea: <>Finance teams check invoices by hand, and one wrong payment is expensive.</>,
    pass: <>An agent that reads the invoice, checks the GST maths, matches the purchase order and runs 11 coded rules. <strong>AI reads the document; rules decide whether money goes out.</strong></>,
    goal: <>Approve, hold or reject in about 8 seconds, catching split invoices, near-duplicates and a changed bank account.</>,
    links: [{ label: 'Try the live demo', href: 'https://invoice-decision-agent.onrender.com/', solid: true }, { label: 'Code on GitHub', href: 'https://github.com/devashish-1305/invoice-decision-agent' }],
  },
  {
    title: 'repo2bench', tag: 'AI evaluation',
    what: 'Turns any Python repository into validated tasks for testing AI coding agents.',
    stat: '87%', unit: 'of injected bugs caught (66 of 76)',
    idea: <>Teams testing AI coding agents need tasks they can trust, and most benchmarks can't prove their own tasks are right.</>,
    pass: <>A six-stage pipeline with a five-gate validator, plus a custom mutation engine that plants bugs to test the tests.</>,
    goal: <><strong>10 validated tasks from 1,050 commits</strong>, reproducible byte for byte from a fresh checkout.</>,
    links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/repo2bench' }],
  },
  {
    title: 'deal-radar', tag: 'Research tooling',
    what: 'Ranks UK private companies by how likely they are to be sold in the next year, from public data only.',
    stat: '0', unit: 'false signals from the model I chose',
    idea: <>Research teams at expert networks want to know which private companies are about to change hands, before it happens.</>,
    pass: <>Point-in-time scoring from Companies House and news, with leakage guards and Claude extracting signals as verbatim quotes.</>,
    goal: <>Picked Sonnet over a 13× cheaper model because it made zero false signals. <strong>Reported honestly that the simplest signal won.</strong></>,
    links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/deal-radar' }],
  },
  {
    title: 'Credit risk intelligence', tag: 'Banking analytics',
    what: 'Default-risk models, a dashboard and an assistant for a 10,000-customer retail bank portfolio.',
    stat: '10K', unit: 'customers, synthetic portfolio',
    idea: <>A risk team needs to see where a loan book could go wrong, and ask questions without writing SQL.</>,
    pass: <>Logistic regression and LightGBM models, an interactive dashboard, and an assistant where a human approves every query before it runs.</>,
    goal: <>Shipped with a product brief, limitations, a monitoring note and <strong>a deck written for a Chief Risk Officer</strong>.</>,
    links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/credit-risk-intelligence' }],
  },
  {
    title: 'Evidence-first outreach', tag: 'Go-to-market, private repo',
    what: 'Finds and qualifies companies, then writes outreach where every claim traces to a real quote.',
    stat: '13', unit: 'send-ready leads out of 236 sourced',
    idea: <>Sales outreach is full of claims nobody checked.</>,
    pass: <>The LLM only extracts evidence, plain Python decides who qualifies, and a separate checker blocks any claim it can't trace.</>,
    goal: <><strong>It stopped at 13 rather than bend the evidence to hit 15.</strong> 323 searches and 60 model calls, replayable.</>,
  },
];

/** Projects accordion: each row opens into idea → pass → goal. */
export default function Projects() {
  const { first, pop } = useGame();
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (idx: number, e: MouseEvent<HTMLButtonElement>) => {
    const isOpen = !open.has(idx);
    setOpen(prev => { const n = new Set(prev); if (isOpen) n.add(idx); else n.delete(idx); return n; });
    if (isOpen && first('hl', idx)) {
      const r = e.currentTarget.getBoundingClientRect();
      pop('GOAL!', e.clientX || r.right - 90, e.clientY || r.top + 30);
    }
  };

  return (
    <section className="s" id="highlights">
      <div className="s-head">
        <h2>Projects</h2>
        <p>Five builds, each told the same way: <strong>the idea</strong> someone had, <strong>the pass</strong> I played, and <strong>the goal</strong> it scored. Open one.</p>
      </div>
      <div className="hl">
        {PROJECTS.map((p, idx) => (
          <div key={p.title} className={`hl-row${open.has(idx) ? ' open' : ''}`}>
            <button className="hl-btn" aria-expanded={open.has(idx)} onClick={e => toggle(idx, e)}>
              <h3>{p.title}<small>{p.tag}</small></h3>
              <span className="what">{p.what}</span>
              <span className="stat"><span className="n">{p.stat}</span><span className="u">{p.unit}</span></span>
            </button>
            <div className="hl-detail"><div>
              <div className="ipg">
                <div><h5><i></i>The idea</h5><p>{p.idea}</p></div>
                <div><h5><i></i>The pass</h5><p>{p.pass}</p></div>
                <div><h5><i></i>The goal</h5><p>{p.goal}</p></div>
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
