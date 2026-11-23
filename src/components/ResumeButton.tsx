import type { MouseEvent } from 'react';
import { pops, site } from '../content';
import { centerOf } from '../fx';
import { useGame } from '../game';

/** Downloads /resume.pdf. The first click (from either button) scores and pops. */
export default function ResumeButton({ label }: { label: string }) {
  const { first, pop } = useGame();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!first('resume')) return;
    const [x, y] = centerOf(e.currentTarget);
    pop(pops.resume, x, y - 80);
  };
  return (
    <a className="btn" href={site.resume.href} download={site.resume.filename} target="_blank" rel="noopener" onClick={onClick}>{label}</a>
  );
}
