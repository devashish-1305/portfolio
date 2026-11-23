/* All visible copy for the site lives here. Edit text freely; components only render it.

   Inline formatting inside strings:
     **bold**          → <strong> (or <b> where noted)
     [label](#anchor)  → link
   Placeholders like {n} or {total} are filled in by the component and noted next to the field. */

export type CursorKind = 'ball' | 'tennis' | 'f1' | 'run' | 'mic' | 'story';
export type Link = { label: string; href: string };

export const site = {
  name: 'Devashish Dwivedi',
  email: 'devashish.dwivedi.13@gmail.com',
  links: {
    linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/devashish-dwivedi' },
    github: { label: 'GitHub', href: 'https://github.com/devashish-1305' },
  },
  // The PDF lives in public/. filename is what it saves as.
  resume: { href: '/resume.pdf', filename: 'Devashish_Dwivedi_Resume.pdf' },
  footer: 'Built by Devashish Dwivedi. Every number on this page is from my own work.',
};

export const header = {
  crestNumber: '8',
  crestName: 'Devashish',
  crestAria: 'Back to the top',
  navAria: 'Sections',
  nav: [
    { label: 'Career', href: '#career' },
    { label: 'Projects', href: '#highlights' },
    { label: 'Research', href: '#research' },
    { label: 'How I play', href: '#how' },
    { label: 'Off the clock', href: '#off' },
    { label: 'Contact', href: '#fulltime' },
  ] as Link[],
  scoreboard: {
    left: 'TALK',
    right: 'ACTION',
    title: 'Talk is cheap. Everything you do on this page counts as action.',
    scoreAria: 'Score',
    clockStartMinutes: 23,
    clockTitle: 'Twenty-three and already on the scoresheet',
  },
};

/** Pop-up words for interactions outside the hobby cards. */
export const pops = {
  pass: 'GOAL!',
  project: 'GOAL!',
  race: 'P1',
  emailCopied: 'SIGNED!',
  resume: 'SCOUTED!',
  messiOn: 'GOAT',
  messiOff: 'CLASSIC',
};

export const hero = {
  aria: 'Summary',
  title: 'I play the pass between the idea and the goal.',
  summary: "**Devashish Dwivedi, 23, AI builder in Gurugram.** Most problems stay problems because nobody passes them on properly. I sit between the business and the engineers, turn what people mean into AI systems that ship, and make sure they still work once they're live. Talk is cheap. I play the ball.",
  facts: [
    { value: '3.5 yrs', label: 'building ML and LLM systems' },
    { value: '3', label: 'production systems shipped at Benefi' },
    { value: 'Now', label: 'available to join, no notice period' },
  ],
  cta: {
    primary: { label: 'See the projects', href: '#highlights' },
    secondary: { label: 'Get in touch', href: '#fulltime' },
    resume: 'Download resume',
  },
  pass: {
    aria: 'How I work, as a pass from your idea to a shipped goal',
    replay: 'Play the pass',
    // x/y are positions on the 600×420 board; lx/ly offset the label. Keep 6 steps: the last one is the goal.
    steps: [
      { t: 'Your idea', d: 'Someone has a problem, or half an idea of a fix.', x: 62, y: 350, lx: 0, ly: 42, cls: 'you' },
      { t: 'Listen', d: 'I sit with them until I can say the problem back in plain words.', x: 170, y: 250, lx: -6, ly: -26, cls: '' },
      { t: 'Translate', d: 'Turn it into a plan both the business and the engineers sign off on.', x: 300, y: 300, lx: 0, ly: 44, cls: '' },
      { t: 'Build', d: 'End to end: data, model, API and the screen someone clicks.', x: 385, y: 170, lx: -10, ly: -26, cls: '' },
      { t: 'Prove', d: 'Evals, tests and numbers before anyone has to trust it.', x: 470, y: 250, lx: 12, ly: 44, cls: '' },
      { t: 'Goal', d: 'It ships, and it still holds up once it’s live.', x: 568, y: 80, lx: -50, ly: 60, cls: 'goal' },
    ],
  },
};

export const career = {
  title: 'Career so far',
  intro: "From a legal NLP internship in 2023 to owning **three production ML and LLM systems** at Benefi Global. I race to win and I don't lift off. Start the race to run through it.",
  go: 'Lights out',
  orClick: 'Or click the car.',
  carAria: 'Launch the car',
  carNumber: '23',
  // gate: label on the track gate. detail: **bold** renders as <b>. Keep 6 laps (they map to the 6 track gates).
  laps: [
    { gate: '2023', yr: '2023', co: 'MikeLegal', role: 'Data science intern', detail: 'Legal NLP: contract automation, case outcome models' },
    { gate: '2023', yr: '2023–24', co: 'Tennovate', role: 'Data science intern', detail: 'Inventory system, stockouts down **3.7%**' },
    { gate: '2024', yr: '2024', co: 'AppSynergies', role: 'Data science intern, UK remote', detail: 'Engagement up **17.6%**, churn down **8%**' },
    { gate: '2024', yr: '2024', co: 'IIIT Delhi', role: 'Research intern', detail: 'The maths of optimising ML algorithms' },
    { gate: '2024', yr: '2024–26', co: 'Benefi Global', role: 'Data scientist, US remote', detail: 'Owned the ML and LLMOps lifecycle' },
    { gate: 'NOW', yr: 'Now', co: 'Your team?', role: 'AI builder, FDE, solutions', detail: 'Available **immediately**', now: true },
  ],
  feature: {
    title: 'Benefi Global',
    meta: [
      'Data scientist, Oct 2024 to Oct 2026. A US crypto-donations platform for nonprofits, built pre-launch.',
      'I owned the full lifecycle: features, deployment, CI/CD, monitoring and model versioning. I also mentored juniors and handled outreach to nonprofit partners.',
    ],
    wins: [
      { n: '97.4%', title: 'An eval that became the release gate', text: 'LLM-as-judge on a 25,000-example golden set (0.97 F1). Every prompt and model change had to pass it.' },
      { n: '~15%', title: 'Less transaction slippage', text: 'Forecasting across 5 blockchains, served at 95ms p95, retraining itself when drift monitoring fired.' },
      { n: '3.5M+', title: 'Ranked donor matches', text: 'A hybrid recommendation engine across 70,000+ nonprofits, using text, embeddings and location.' },
      { n: '6', title: 'Moderation categories, with humans in the loop', text: 'An LLM moderation pipeline with guardrails, tracing and annotation queues.' },
    ],
  },
  also: '**Also:** part-time data scientist at Outlier since 2024. First runner-up at WebWars (NIT Trichy) and a Smart India Hackathon 2023 finalist.',
};

export type Project = {
  title: string; tag: string; what: string; stat: string; unit: string;
  idea: string; pass: string; goal: string;
  links?: (Link & { solid?: boolean })[];
};

export const projects = {
  title: 'Projects',
  intro: 'Five builds, each told the same way: **the idea** someone had, **the pass** I played, and **the goal** it scored. Open one.',
  labels: { idea: 'The idea', pass: 'The pass', goal: 'The goal' },
  items: [
    {
      title: 'Invoice decision agent', tag: 'Finance operations, live demo',
      what: 'Reads Indian GST invoices and decides approve, hold or reject, with the evidence behind it.',
      stat: '~8s', unit: 'per invoice, end to end',
      idea: 'Finance teams check invoices by hand, and one wrong payment is expensive.',
      pass: 'An agent that reads the invoice, checks the GST maths, matches the purchase order and runs 11 coded rules. **AI reads the document; rules decide whether money goes out.**',
      goal: 'Approve, hold or reject in about 8 seconds, catching split invoices, near-duplicates and a changed bank account.',
      links: [
        { label: 'Try the live demo', href: 'https://invoice-decision-agent.onrender.com/', solid: true },
        { label: 'Code on GitHub', href: 'https://github.com/devashish-1305/invoice-decision-agent' },
      ],
    },
    {
      title: 'repo2bench', tag: 'AI evaluation',
      what: 'Turns any Python repository into validated tasks for testing AI coding agents.',
      stat: '87%', unit: 'of injected bugs caught (66 of 76)',
      idea: "Teams testing AI coding agents need tasks they can trust, and most benchmarks can't prove their own tasks are right.",
      pass: 'A six-stage pipeline with a five-gate validator, plus a custom mutation engine that plants bugs to test the tests.',
      goal: '**10 validated tasks from 1,050 commits**, reproducible byte for byte from a fresh checkout.',
      links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/repo2bench' }],
    },
    {
      title: 'deal-radar', tag: 'Research tooling',
      what: 'Ranks UK private companies by how likely they are to be sold in the next year, from public data only.',
      stat: '0', unit: 'false signals from the model I chose',
      idea: 'Research teams at expert networks want to know which private companies are about to change hands, before it happens.',
      pass: 'Point-in-time scoring from Companies House and news, with leakage guards and Claude extracting signals as verbatim quotes.',
      goal: 'Picked Sonnet over a 13× cheaper model because it made zero false signals. **Reported honestly that the simplest signal won.**',
      links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/deal-radar' }],
    },
    {
      title: 'Credit risk intelligence', tag: 'Banking analytics',
      what: 'Default-risk models, a dashboard and an assistant for a 10,000-customer retail bank portfolio.',
      stat: '10K', unit: 'customers, synthetic portfolio',
      idea: 'A risk team needs to see where a loan book could go wrong, and ask questions without writing SQL.',
      pass: 'Logistic regression and LightGBM models, an interactive dashboard, and an assistant where a human approves every query before it runs.',
      goal: 'Shipped with a product brief, limitations, a monitoring note and **a deck written for a Chief Risk Officer**.',
      links: [{ label: 'Code on GitHub', href: 'https://github.com/devashish-1305/credit-risk-intelligence' }],
    },
    {
      title: 'Evidence-first outreach', tag: 'Go-to-market, private repo',
      what: 'Finds and qualifies companies, then writes outreach where every claim traces to a real quote.',
      stat: '13', unit: 'send-ready leads out of 236 sourced',
      idea: 'Sales outreach is full of claims nobody checked.',
      pass: "The LLM only extracts evidence, plain Python decides who qualifies, and a separate checker blocks any claim it can't trace.",
      goal: '**It stopped at 13 rather than bend the evidence to hit 15.** 323 searches and 60 model calls, replayable.',
    },
  ] as Project[],
};

export const research = {
  title: 'Research',
  intro: 'F1 teams win on telemetry: decide what to measure, then trust the data. I ran my own quant study the same way. **When three or more company insiders buy their own stock within 30 days, does the price follow?**',
  chart: {
    caption: 'Extra return over the market after an insider cluster, with 95% confidence band',
    readout: 'DAY {day}: +{value}%', // {day} and {value} are filled from the selected point
    xAxis: 'Trading days after the cluster',
    yAxis: ['-1%', '0%', '1%', '2%', '3%', '4%'],
    aria: 'Mean cumulative abnormal return rises to 1.22% after one day, 1.65% after 30 trading days and 3.23% after 60.',
    defaultDay: 30,
    // [trading day, mean extra return %, 95% CI low, 95% CI high]
    points: [[0, 0, 0, 0], [1, 1.22, 0.98, 1.46], [5, 1.47, 1.15, 1.79], [30, 1.65, 1.05, 2.25], [60, 3.23, 2.18, 4.28]] as [number, number, number, number][],
  },
  readouts: [
    { n: '+1.65%', u: 'average extra return over 30 trading days' },
    { n: '5.42', u: 't-statistic, p < 1e-7' },
    { n: '2,664', u: 'insider clusters, US stocks 2015–2024' },
    { n: '1,030', u: 'companies in the sample' },
  ],
  notes: [
    "**Pre-registered.** The signal, filters and tests were fixed before I saw a single result, so the finding couldn't be shaped afterwards.",
    "It holds under risk adjustment, other cluster definitions and both halves of the decade. It's observational, not causal, and trading costs aren't modelled yet.",
  ],
  link: { label: 'Read the paper and code', href: 'https://github.com/devashish-1305/insider-cluster-alpha' },
  thread: {
    title: "Why it's here",
    text: "It's the same habit behind [deal-radar and repo2bench](#highlights): decide the test before you see the result, then report what the data says, even when it's boring. Next up is **Alphatrace**, a research system that logs every hypothesis tested, not just the ones that worked.",
  },
};

export const howIPlay = {
  title: 'How I play',
  intro: "An attacking midfielder doesn't score every goal. He sees the move before anyone else, plays the pass, and keeps the team's shape. **Same job, different pitch.**",
  phases: [
    { k: 'First phase', title: 'Read the game', text: 'Sit with the people who have the problem. Work out what they actually need, and say it back in plain words before writing a line of code.', kit: 'Discovery calls, client demos, partner outreach, presenting for the team.' },
    { k: 'Second phase', title: 'Build the move', text: 'Pick the simplest thing that works, then build it end to end, from data pipeline to the screen someone clicks.', kit: 'Python, LLMs, RAG, agents, LangGraph, FastAPI, React, AWS.' },
    { k: 'Third phase', title: 'See it out', text: "A lead isn't a win until the whistle. Systems get evaluated, monitored and made reproducible, so they still work next month.", kit: 'Evals, LLM-as-judge, guardrails, drift monitoring, replayable runs.' },
  ],
  quote: 'The model proposes. Deterministic code decides.',
  move: '**Signature move: making evals stick.** At Benefi nobody owned whether an LLM change was safe to ship; the check was eyeballing a few outputs. I built an eval and ran it in shadow mode. It caught a prompt change that looked fine overall but had broken one category. With caching and a fallback model it cost less than manual review, and it became the release gate for every change.',
  stat: { n: '0.97', u: 'F1 on a 25,000-example golden set' },
};

/** id picks the illustration and mini animation in OffTheClock.tsx. */
export type CardId = 'football' | 'f1' | 'tennis' | 'running' | 'music' | 'story';
export type HobbyCard = {
  id: CardId; cursor: CursorKind; aria: string; title: string; blurb: string;
  back: string; link: Link; pop: string; popStyle?: 'p1';
};

export const offTheClock = {
  title: 'Off the clock',
  intro: "Everything I love outside work turns up inside it. **Flip a card to see where.** I'm a lifelong people-watcher and, by most accounts, resourceful: if there's a way through, I find it.",
  flipHint: 'Flip',
  backTitle: 'At work',
  flipBack: 'Flip back',
  ariaSuffix: '. Flip to see how it shows up at work',
  art: { jerseyName: 'DEVASHISH', jerseyNumber: '8', driverNumber: '23', vinylLabel: ['ON', 'REPEAT'] },
  storyLines: ['Once there was a messy spreadsheet', 'Someone asked the right questions', 'It became a system that ships'],
  cards: [
    { id: 'football', cursor: 'ball', aria: 'Football', title: 'Football', blurb: 'Barça, and Messi above everyone. I play attacking midfield.', back: "I'm the passer. An assist counts as much as a goal, so I make the people around me look good.", link: { label: 'See how I play', href: '#how' }, pop: 'GOAL!' },
    { id: 'f1', cursor: 'f1', aria: 'Formula 1', title: 'Formula 1', blurb: "Max's mentality: no lifting off, no settling for second.", back: "F1 runs on telemetry, and so do I. It's why I wrote a quant research paper for fun.", link: { label: 'See the research', href: '#research' }, pop: 'P1', popStyle: 'p1' },
    { id: 'tennis', cursor: 'tennis', aria: 'Tennis', title: 'Tennis', blurb: 'One on one, nowhere to hide.', back: 'I own the whole point, from the first client call to the dashboard watching the model in production.', link: { label: 'See the career', href: '#career' }, pop: 'ACE!' },
    { id: 'running', cursor: 'run', aria: 'Running', title: 'Running', blurb: 'Steady miles over sprints.', back: "Pace beats panic. repo2bench shipped 10 tasks I could prove, not 100 I couldn't.", link: { label: 'See the projects', href: '#highlights' }, pop: 'PB!' },
    { id: 'music', cursor: 'mic', aria: 'R&B and hip-hop', title: 'R&B and hip-hop', blurb: 'Zayn, Chris Brown, The Weeknd, Travis Scott, Don Toliver. And yes, I sing.', back: 'A good song tells a whole story in three minutes. I explain systems the same way, to a CFO, a PM or an engineer.', link: { label: 'Hear it in the projects', href: '#highlights' }, pop: 'ENCORE!' },
    { id: 'story', cursor: 'story', aria: 'Storytelling and people', title: 'Stories and people', blurb: 'A lifelong people-watcher. Apparently the life of the party.', back: 'Requirements are mostly listening. Demos are mostly storytelling. Both are the pass.', link: { label: 'Watch the pass', href: '#top' }, pop: 'PLOT TWIST!' },
  ] as HobbyCard[],
};

export const fullTime = {
  title: 'Full time.',
  // {n} = how many the visitor has done (rendered bold), {total} = how many exist.
  recap: {
    pass: 'Played the pass',
    race: 'Started the race',
    hl: 'Opened {n} of {total} projects',
    cards: 'Flipped {n} of {total} cards',
    resume: 'Grabbed the resume',
  },
  lead: "You bring the idea. I'll play the pass.",
  sub: 'Open to AI builder, forward deployed engineer and AI solutions roles, where business meets tech. Bengaluru, Gurugram or Mumbai, or remote from anywhere. Available now.',
  copyEmail: 'Copy my email',
  resume: 'Download resume',
  copied: 'Email copied',
  copyFailed: 'Select the address below',
  emailLine: 'Or write to',
};
