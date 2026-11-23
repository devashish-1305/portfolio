/* Confetti canvas + comic pop-ups, ported 1:1 from the prototype. Imperative on purpose:
   they live outside React's tree and fire hundreds of frames a second. */

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(pointer: fine)').matches;

type Part = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; life: number; sq: boolean };

let cv: HTMLCanvasElement | null = null;
let cx: CanvasRenderingContext2D | null = null;
let parts: Part[] = [];
let raf: number | null = null;
const COLS = ['#B3123F', '#1F52B5', '#FFB627', '#EEF2E6'];

const size = () => {
  if (!cv) return;
  cv.width = innerWidth * devicePixelRatio;
  cv.height = innerHeight * devicePixelRatio;
};

export function attachCanvas(el: HTMLCanvasElement) {
  cv = el;
  cx = el.getContext('2d');
  size();
  addEventListener('resize', size);
  return () => {
    removeEventListener('resize', size);
    if (raf) cancelAnimationFrame(raf);
    raf = null; parts = []; cv = null; cx = null;
  };
}

export function burst(x: number, y: number, n: number) {
  if (reduce || !cx) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 3 + Math.random() * 5, c: COLS[i % 4], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 90 + Math.random() * 40, sq: Math.random() < 0.5 });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  if (!cv || !cx) { raf = null; return; }
  const d = devicePixelRatio;
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) {
    p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    cx.save(); cx.globalAlpha = Math.min(1, p.life / 40); cx.translate(p.x * d, p.y * d); cx.rotate(p.rot); cx.fillStyle = p.c;
    if (p.sq) cx.fillRect(-p.r * d, -p.r * d * 0.5, p.r * 2 * d, p.r * d);
    else { cx.beginPath(); cx.arc(0, 0, p.r * d * 0.8, 0, 7); cx.fill(); }
    cx.restore();
  }
  if (parts.length) raf = requestAnimationFrame(tick);
  else { cx.clearRect(0, 0, cv.width, cv.height); raf = null; }
}

export type PopOpts = { big?: boolean; p1?: boolean };

/** Shows the pop-up text and confetti. Scoring is handled by the caller (see game.tsx). */
export function showPop(text: string, x: number, y: number, opts: PopOpts = {}) {
  const el = document.createElement('div');
  el.className = 'pop' + (opts.p1 ? ' p1' : '');
  el.textContent = text;
  const fs = opts.big ? Math.min(innerWidth * 0.2, 200) : Math.min(innerWidth * 0.11, 80);
  el.style.fontSize = fs + 'px';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const half = el.offsetWidth / 2 + 24;
  el.style.left = (half * 2 > innerWidth ? innerWidth / 2 : Math.max(half, Math.min(innerWidth - half, x))) + 'px';
  el.style.top = Math.max(fs, Math.min(innerHeight - fs * 0.6, y)) + 'px';
  el.style.visibility = '';
  setTimeout(() => el.remove(), 1600);
  burst(x, y, opts.big ? 150 : 44);
}

export const centerOf = (el: Element): [number, number] => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};
