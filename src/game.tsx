import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { showPop, type PopOpts } from './fx';

export type CursorKind = 'ball' | 'tennis' | 'f1' | 'run' | 'mic' | 'story';
export type CursorApi = { set(c: CursorKind): void; toggleGold(): boolean };

type Stats = { pass: boolean; race: boolean; hl: Set<number>; cards: Set<number> };
export type StatKey = keyof Stats;

type Game = {
  goals: number;
  stats: Stats;
  /** Records an achievement. Returns true the first time (and only then). */
  first(k: 'pass' | 'race'): boolean;
  first(k: 'hl' | 'cards', idx: number): boolean;
  pop(text: string, x: number, y: number, opts?: PopOpts & { noscore?: boolean }): void;
  cursor: RefObject<CursorApi | null>;
  race: RefObject<(() => void) | null>;
};

const Ctx = createContext<Game | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState(0);
  const [version, rerender] = useState(0);
  const stats = useRef<Stats>({ pass: false, race: false, hl: new Set(), cards: new Set() }).current;
  const cursor = useRef<CursorApi | null>(null);
  const race = useRef<(() => void) | null>(null);

  const first = useCallback((k: StatKey, idx?: number) => {
    let isNew = false;
    if (k === 'pass' || k === 'race') { isNew = !stats[k]; stats[k] = true; }
    else { isNew = !stats[k].has(idx!); stats[k].add(idx!); }
    if (isNew) rerender(n => n + 1);
    return isNew;
  }, [stats]) as Game['first'];

  const pop = useCallback<Game['pop']>((text, x, y, opts = {}) => {
    showPop(text, x, y, opts);
    if (!opts.noscore) setGoals(g => g + 1);
  }, []);

  const value = useMemo(() => ({ goals, stats, first, pop, cursor, race }), [goals, stats, first, pop, version]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const g = useContext(Ctx);
  if (!g) throw new Error('useGame outside GameProvider');
  return g;
}
