import { Fragment, type CSSProperties, type ReactNode } from 'react';

/** Renders the tiny markup used in content.ts: **bold** and [label](href).
    `bold` picks the tag (<strong> by default, <b> for the LED-style numbers). */
export function Rich({ text, bold = 'strong', boldStyle }: { text: string; bold?: 'strong' | 'b'; boldStyle?: CSSProperties }) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) { const B = bold; out.push(<B key={k++} style={boldStyle}>{m[1]}</B>); }
    else out.push(<a key={k++} href={m[3]}>{m[2]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}

/** Fills {name} placeholders with nodes, e.g. fill('Opened {n} of {total}', { n: <b>2</b>, total: 5 }). */
export function fill(text: string, values: Record<string, ReactNode>): ReactNode {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return <Fragment key={i}>{key && key in values ? values[key] : part}</Fragment>;
  });
}
