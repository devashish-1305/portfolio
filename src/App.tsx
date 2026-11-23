import { useEffect, useRef } from 'react';
import { attachCanvas, reduce } from './fx';
import { GameProvider, useGame } from './game';
import SvgDefs from './components/SvgDefs';
import CursorBall from './components/CursorBall';
import Scoreboard from './components/Scoreboard';
import Hero from './components/Hero';
import Career from './components/Career';
import Projects from './components/Projects';
import Research from './components/Research';
import HowIPlay from './components/HowIPlay';
import OffTheClock from './components/OffTheClock';
import FullTime from './components/FullTime';

export default function App() {
  return (
    <GameProvider>
      <Page />
    </GameProvider>
  );
}

function Page() {
  const fx = useRef<HTMLCanvasElement>(null);
  useEffect(() => attachCanvas(fx.current!), []);
  useEasterEggs();

  return (
    <>
      <SvgDefs />
      <CursorBall />
      <canvas id="fx" ref={fx} aria-hidden="true" />
      <Scoreboard />
      <main id="top">
        <Hero />
        <Career />
        <Projects />
        <Research />
        <HowIPlay />
        <OffTheClock />
        <FullTime />
      </main>
      <footer>Built by Devashish Dwivedi. Every number on this page is from my own work.</footer>
    </>
  );
}

/** Type "messi" to toggle the gold ball, "max" to jump to the career race and start it. */
function useEasterEggs() {
  const { pop, cursor, race } = useGame();
  useEffect(() => {
    let buf = '';
    let raceTimer: number | undefined;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-8);
      if (buf.endsWith('messi')) {
        const on = cursor.current?.toggleGold() ?? false;
        pop(on ? 'GOAT' : 'CLASSIC', innerWidth / 2, innerHeight / 2, { big: true, noscore: true });
        buf = '';
      }
      if (buf.endsWith('max')) {
        document.getElementById('career')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        clearTimeout(raceTimer);
        raceTimer = window.setTimeout(() => race.current?.(), 700);
        buf = '';
      }
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); clearTimeout(raceTimer); };
  }, [pop, cursor, race]);
}
