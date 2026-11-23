import { useEffect, useRef, type ReactNode } from 'react';
import { reduce, centerOf } from '../fx';
import { useGame, type CursorKind } from '../game';

const POPS = ['GOAL!', 'P1', 'ACE!', 'PB!', 'ENCORE!', 'PLOT TWIST!'];
const STORY = ['Once there was a messy spreadsheet', 'Someone asked the right questions', 'It became a system that ships'];

type Card = {
  cursor: CursorKind; label: string; scene: string; title: string; blurb: string;
  back: string; link: { label: string; href: string }; art: ReactNode;
};

/** Six hobby cards. Click plays a mini animation, then flips to show where it shows up at work. */
export default function OffTheClock() {
  const { first, pop, cursor } = useGame();
  const live = useRef({ first, pop });
  live.current = { first, pop };
  const watch = useRef<HTMLSpanElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const intervals = useRef<{ watch?: number; type?: number }>({});
  const storyIx = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    clearInterval(intervals.current.watch); clearInterval(intervals.current.type); timers.current.forEach(clearTimeout);
  }, []);

  const runWatch = () => {
    const w = watch.current!; let t = 0;
    clearInterval(intervals.current.watch);
    intervals.current.watch = window.setInterval(() => {
      t += 1.7; const m = Math.floor(t / 60), s = t % 60;
      w.textContent = String(m).padStart(2, '0') + ':' + s.toFixed(1).padStart(4, '0');
      if (t > 42) clearInterval(intervals.current.watch);
    }, 20);
  };

  const typeNext = () => {
    const el = typed.current!;
    storyIx.current = (storyIx.current + 1) % STORY.length;
    const s = STORY[storyIx.current]; let n = 0;
    clearInterval(intervals.current.type); el.textContent = '';
    intervals.current.type = window.setInterval(() => { el.textContent = s.slice(0, ++n); if (n >= s.length) clearInterval(intervals.current.type); }, reduce ? 0 : 28);
  };

  const CARDS: Card[] = [
    {
      cursor: 'ball', label: 'Football', scene: 'sc-foot', title: 'Football', blurb: 'Barça, and Messi above everyone. I play attacking midfield.',
      back: "I'm the passer. An assist counts as much as a goal, so I make the people around me look good.", link: { label: 'See how I play', href: '#how' },
      art: (
        <svg viewBox="0 0 200 230" aria-hidden="true">
          <rect x="0" y="206" width="200" height="24" fill="#0b2c1b" />
          <rect x="70" y="150" width="17" height="52" rx="6" fill="#8a5a3c" /><rect x="113" y="150" width="17" height="52" rx="6" fill="#8a5a3c" />
          <rect x="69" y="172" width="19" height="30" rx="4" fill="#B3123F" /><rect x="112" y="172" width="19" height="30" rx="4" fill="#B3123F" />
          <rect x="64" y="198" width="27" height="10" rx="5" fill="#111" /><rect x="109" y="198" width="27" height="10" rx="5" fill="#111" />
          <path d="M62 128 H138 L142 160 H58 Z" fill="#13306E" />
          <path d="M50 70 Q100 56 150 70 L176 104 L160 114 L146 98 L144 134 H56 L54 98 L40 114 L24 104 Z" fill="url(#stripes)" />
          <rect x="22" y="104" width="16" height="40" rx="7" fill="#8a5a3c" transform="rotate(14 30 104)" /><rect x="162" y="104" width="16" height="40" rx="7" fill="#8a5a3c" transform="rotate(-14 170 104)" />
          <rect x="91" y="48" width="18" height="16" fill="#8a5a3c" />
          <circle cx="100" cy="36" r="20" fill="#8a5a3c" /><path d="M80 36 A20 20 0 0 1 120 36 Q120 48 112 54 L88 54 Q80 48 80 36 Z" fill="#1a1310" />
          <circle cx="80" cy="40" r="4" fill="#8a5a3c" /><circle cx="120" cy="40" r="4" fill="#8a5a3c" />
          <text x="100" y="86" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontWeight="800" fontSize="12" letterSpacing="1.5" fill="#EEF2E6">DEVASHISH</text>
          <text x="100" y="124" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontWeight="900" fontSize="36" fill="#EEF2E6">8</text>
          <use className="kick" href="#ball" x="140" y="186" width="22" height="22" />
        </svg>
      ),
    },
    {
      cursor: 'f1', label: 'Formula 1', scene: 'sc-f1', title: 'Formula 1', blurb: "Max's mentality: no lifting off, no settling for second.",
      back: "F1 runs on telemetry, and so do I. It's why I wrote a quant research paper for fun.", link: { label: 'See the research', href: '#research' },
      art: (
        <>
          <svg viewBox="0 0 200 230" aria-hidden="true">
            <rect x="66" y="146" width="28" height="58" rx="6" fill="#13306E" /><rect x="106" y="146" width="28" height="58" rx="6" fill="#13306E" />
            <rect x="62" y="198" width="34" height="11" rx="5" fill="#111" /><rect x="104" y="198" width="34" height="11" rx="5" fill="#111" />
            <path d="M54 76 Q100 62 146 76 L150 150 H50 Z" fill="#13306E" />
            <path d="M54 76 L50 150 H60 L64 78 Z M146 76 L150 150 H140 L136 78 Z" fill="#B3123F" />
            <rect x="50" y="140" width="100" height="10" fill="#B3123F" />
            <path d="M56 80 Q34 104 50 134" fill="none" stroke="#13306E" strokeWidth="16" strokeLinecap="round" /><path d="M144 80 Q166 104 150 134" fill="none" stroke="#13306E" strokeWidth="16" strokeLinecap="round" />
            <circle cx="52" cy="134" r="8" fill="#FFB627" /><circle cx="148" cy="134" r="8" fill="#FFB627" />
            <text x="118" y="104" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontWeight="900" fontSize="20" fill="#EEF2E6">23</text>
            <rect x="86" y="60" width="28" height="12" rx="4" fill="#0a0f14" />
            <circle cx="100" cy="38" r="25" fill="#FFB627" />
            <path d="M75 34 Q100 22 125 34 L125 30 Q100 14 75 30 Z" fill="#B3123F" />
            <rect x="80" y="36" width="40" height="14" rx="7" fill="#101418" />
            <path d="M84 40 H110" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <svg className="mini-car" viewBox="0 0 240 72" aria-hidden="true"><path d="M12 50 L12 38 Q36 31 66 29 L92 23 Q108 17 124 25 L150 32 Q190 37 226 45 L230 50 Z" fill="#13306E" /><circle cx="46" cy="53" r="15" fill="#0b0b0b" /><circle cx="192" cy="54" r="13" fill="#0b0b0b" /><circle cx="111" cy="20" r="8.5" fill="#FFB627" /></svg>
        </>
      ),
    },
    {
      cursor: 'tennis', label: 'Tennis', scene: 'sc-tennis', title: 'Tennis', blurb: 'One on one, nowhere to hide.',
      back: 'I own the whole point, from the first client call to the dashboard watching the model in production.', link: { label: 'See the career', href: '#career' },
      art: (
        <svg viewBox="0 0 300 200" aria-hidden="true" style={{ width: '92%', height: 'auto' }}>
          <rect x="20" y="20" width="260" height="160" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M20 40 H280 M20 160 H280 M150 40 V160 M85 40 V160 M215 40 V160 M85 100 H215" stroke="#fff" strokeWidth="2.5" fill="none" />
          <path d="M150 14 V186" stroke="#e8e8e8" strokeWidth="4" strokeDasharray="3 3" />
          <use className="tball" href="#tball" x="40" y="50" width="22" height="22" />
        </svg>
      ),
    },
    {
      cursor: 'run', label: 'Running', scene: 'sc-run', title: 'Running', blurb: 'Steady miles over sprints.',
      back: 'Pace beats panic. repo2bench shipped 10 tasks I could prove, not 100 I couldn\'t.', link: { label: 'See the projects', href: '#highlights' },
      art: (
        <>
          <svg viewBox="0 0 300 200" aria-hidden="true" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
            <path d="M-20 40 Q150 -10 320 40 M-20 80 Q150 30 320 80 M-20 120 Q150 70 320 120 M-20 160 Q150 110 320 160 M-20 200 Q150 150 320 200" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" fill="none" />
          </svg>
          <span className="watch" ref={watch}>00:00.0</span>
        </>
      ),
    },
    {
      cursor: 'mic', label: 'R&B and hip-hop', scene: 'sc-music', title: 'R&B and hip-hop', blurb: 'Zayn, Chris Brown, The Weeknd, Travis Scott, Don Toliver. And yes, I sing.',
      back: 'A good song tells a whole story in three minutes. I explain systems the same way, to a CFO, a PM or an engineer.', link: { label: 'Hear it in the projects', href: '#highlights' },
      art: (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <g className="mini-vinyl">
            <circle cx="100" cy="100" r="82" fill="#0d0d0d" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#1f1f1f" strokeWidth="2" /><circle cx="100" cy="100" r="58" fill="none" stroke="#1f1f1f" strokeWidth="2" /><circle cx="100" cy="100" r="46" fill="none" stroke="#1f1f1f" strokeWidth="2" />
            <path d="M40 60 A75 75 0 0 1 80 28" stroke="rgba(255,255,255,.12)" strokeWidth="6" fill="none" />
            <circle cx="100" cy="100" r="30" fill="#B3123F" /><circle cx="100" cy="100" r="3" fill="#0d0d0d" />
            <text x="100" y="97" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontWeight="900" fontSize="11" fill="#EEF2E6">ON</text>
            <text x="100" y="110" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontWeight="900" fontSize="11" fill="#EEF2E6">REPEAT</text>
          </g>
        </svg>
      ),
    },
    {
      cursor: 'story', label: 'Storytelling and people', scene: 'sc-story', title: 'Stories and people', blurb: 'A lifelong people-watcher. Apparently the life of the party.',
      back: 'Requirements are mostly listening. Demos are mostly storytelling. Both are the pass.', link: { label: 'Watch the pass', href: '#top' },
      art: <span className="typed" ref={typed}>{STORY[0]}</span>,
    },
  ];

  return (
    <section className="s" id="off">
      <div className="s-head">
        <h2>Off the clock</h2>
        <p>Everything I love outside work turns up inside it. <strong>Flip a card to see where.</strong> I'm a lifelong people-watcher and, by most accounts, a jugaadbaaz: if there's a way through, I find it.</p>
      </div>
      <div className="cards">
        {CARDS.map((c, idx) => (
          <FlipCard key={c.title} card={c}
            onEnter={() => cursor.current?.set(c.cursor)} onLeave={() => cursor.current?.set('ball')}
            onPlay={() => { if (idx === 3) runWatch(); if (idx === 5) typeNext(); }}
            onFlipped={el => {
              if (live.current.first('cards', idx)) { const [x, y] = centerOf(el); live.current.pop(POPS[idx], x, y - 60, { p1: idx === 1 }); }
            }}
            later={(fn, ms) => { timers.current.push(window.setTimeout(fn, ms)); }}
          />
        ))}
      </div>
    </section>
  );
}

function FlipCard({ card, onEnter, onLeave, onPlay, onFlipped, later }: {
  card: Card; onEnter(): void; onLeave(): void; onPlay(): void; onFlipped(el: HTMLElement): void; later(fn: () => void, ms: number): void;
}) {
  // Classes "play" and "flipped" are toggled imperatively so the CSS animation can be restarted (remove → reflow → add).
  const root = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLButtonElement>(null);
  const goTo = useRef<HTMLAnchorElement>(null);

  const flip = () => {
    const el = root.current!;
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
    onPlay();
    later(() => {
      el.classList.add('flipped');
      onFlipped(el);
      goTo.current?.focus({ preventScroll: true });
    }, reduce ? 0 : 950);
  };
  const back = () => { root.current!.classList.remove('flipped', 'play'); front.current?.focus({ preventScroll: true }); };

  return (
    <div className="icard" ref={root} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="icard-in">
        <button className="face front" ref={front} aria-label={`${card.label}. Flip to see how it shows up at work`} onClick={flip}>
          <span className={`scene ${card.scene}`}>{card.art}</span>
          <span className="flip-hint">Flip</span>
          <span className="txt"><h3>{card.title}</h3><p>{card.blurb}</p></span>
        </button>
        <div className="face back">
          <div><h4>At work</h4><p>{card.back}</p></div>
          <div className="row"><a className="go-to" href={card.link.href} ref={goTo}>{card.link.label}</a><button className="again" onClick={back}>Flip back</button></div>
        </div>
      </div>
    </div>
  );
}
