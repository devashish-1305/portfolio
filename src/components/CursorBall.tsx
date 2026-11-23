import { useEffect, useRef } from 'react';
import { fine, reduce } from '../fx';
import { useGame, type CursorKind } from '../game';

/** Custom cursor that follows the pointer (desktop, motion allowed). Off the clock cards swap its skin. */
export default function CursorBall() {
  const ref = useRef<HTMLDivElement>(null);
  const { cursor } = useGame();

  useEffect(() => {
    const cb = ref.current!;
    cursor.current = {
      set: (c: CursorKind) => { cb.dataset.c = c; },
      toggleGold: () => cb.classList.toggle('gold'),
    };
    if (!fine || reduce) return () => { cursor.current = null; };

    document.body.classList.add('ball-cursor');
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, rot = 0, sc = 1, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const down = () => { sc = 0.72; };
    const leave = () => { cb.style.opacity = '0'; };
    const enter = () => { cb.style.opacity = '1'; };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);
    const loop = () => {
      const dx = tx - x, dy = ty - y;
      x += dx * 0.32; y += dy * 0.32; rot += dx * 0.9; sc += (1 - sc) * 0.15;
      const spinny = cb.dataset.c === 'ball' || cb.dataset.c === 'tennis';
      const ang = spinny ? rot : Math.max(-22, Math.min(22, dx * 1.4));
      cb.style.transform = `translate(${x}px,${y}px) rotate(${ang}deg) scale(${sc})`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      removeEventListener('pointerdown', down);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
      document.body.classList.remove('ball-cursor');
      cursor.current = null;
    };
  }, [cursor]);

  return (
    <div className="cursorball" ref={ref} data-c="ball" aria-hidden="true">
      <svg className="c-ball" viewBox="0 0 40 40"><use href="#ball" /></svg>
      <svg className="c-tennis" viewBox="0 0 40 40"><use href="#tball" /></svg>
      <svg className="c-f1" viewBox="0 0 40 40"><path d="M5 25 Q5 6 22 6 Q36 6 36 22 V30 Q36 34 32 34 H12 Q5 34 5 28 Z" fill="#FFB627" stroke="#101418" strokeWidth="1.6" /><path d="M14 16 H36 V25 H17 Q13 25 13 20.5 Z" fill="#101418" /><path d="M17 19 H31" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" /><path d="M7 15 Q19 3 34 11" stroke="#B3123F" strokeWidth="3.2" fill="none" strokeLinecap="round" /></svg>
      <svg className="c-run" viewBox="0 0 40 40"><rect x="16.5" y="1.5" width="7" height="5" rx="1.5" fill="#EEF2E6" stroke="#101418" strokeWidth="1.2" /><circle cx="20" cy="23" r="15" fill="#EEF2E6" stroke="#FFB627" strokeWidth="3.4" /><g className="hand"><path d="M20 23 V12" stroke="#B3123F" strokeWidth="2.6" strokeLinecap="round" /></g><circle cx="20" cy="23" r="2.2" fill="#101418" /></svg>
      <svg className="c-mic" viewBox="0 0 40 40"><path d="M11 17 Q11 29 20 29 Q29 29 29 17" fill="none" stroke="#EEF2E6" strokeWidth="2.4" strokeLinecap="round" /><path d="M20 29 V36 M14 37 H26" stroke="#EEF2E6" strokeWidth="2.4" strokeLinecap="round" /><rect x="14" y="3" width="12" height="20" rx="6" fill="#B3123F" stroke="#EEF2E6" strokeWidth="1.6" /><path d="M15 9 H25 M15 13 H25 M15 17 H25" stroke="rgba(238,242,230,.55)" strokeWidth="1.3" /></svg>
      <svg className="c-story" viewBox="0 0 40 40"><path d="M5 8 Q5 4 9 4 H31 Q35 4 35 8 V24 Q35 28 31 28 H16 L8 35 V28 Q5 28 5 24 Z" fill="#EEF2E6" stroke="#101418" strokeWidth="1.5" /><circle className="d1" cx="13" cy="16" r="2.6" fill="#B3123F" /><circle className="d2" cx="20" cy="16" r="2.6" fill="#B3123F" /><circle className="d3" cx="27" cy="16" r="2.6" fill="#B3123F" /></svg>
    </div>
  );
}
