import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { chat as c, pops } from '../content';
import { useGame } from '../game';
import { fill } from '../rich';
import { linkify } from '../links';

type Msg = { role: 'user' | 'assistant'; content: string; error?: boolean };
const HISTORY = 6; // the server enforces this too

/** Floating "Ask me" button + chat panel. Talks to /api/chat, which streams plain text back. */
export default function ChatWidget() {
  const { first, pop } = useGame();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const titleId = useId(), panelId = useId(), inputId = useId();

  const wasOpen = useRef(false);
  const close = () => { setOpen(false); document.body.classList.remove('chat-hover'); };

  // Focus the input on open; give focus back to the launcher on close.
  useEffect(() => {
    if (open) field.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      // Keep Tab cycling inside the panel while it's open.
      if (e.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href]')];
        if (!items.length) return;
        const firstEl = items[0], lastEl = items[items.length - 1], a = document.activeElement as HTMLElement | null;
        const inside = !!a && panel.current.contains(a);
        if (e.shiftKey && (a === firstEl || !inside)) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && (a === lastEl || !inside)) { e.preventDefault(); firstEl.focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => { const l = log.current; if (l) l.scrollTop = l.scrollHeight; }, [msgs, open]);
  useEffect(() => () => { abort.current?.abort(); document.body.classList.remove('chat-hover'); }, []);

  const setLast = (fn: (m: Msg) => Msg) => setMsgs(prev => [...prev.slice(0, -1), fn(prev[prev.length - 1])]);

  async function send(text: string) {
    text = text.trim();
    if (!text || busy) return;
    const history: Msg[] = [...msgs.filter(m => !m.error && m.content), { role: 'user', content: text }];
    setMsgs(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');

    if (text.length > c.maxChars) { setLast(() => ({ role: 'assistant', content: c.errors.tooLong, error: true })); return; }

    if (first('chat') && panel.current) {
      const r = panel.current.getBoundingClientRect();
      pop(pops.chat, r.left + r.width / 2, r.top + 40);
    }

    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-HISTORY).map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null) as { error?: string } | null;
        setLast(() => ({ role: 'assistant', content: err?.error || c.errors.down, error: true }));
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let got = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        got += value;
        setLast(m => ({ ...m, content: m.content + value }));
      }
      if (!got.trim()) setLast(() => ({ role: 'assistant', content: c.errors.empty, error: true }));
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setLast(m => m.content ? { ...m, content: m.content + '\n\n' + c.errors.cutOff } : { role: 'assistant', content: c.errors.network, error: true });
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const left = c.maxChars - input.length;

  return (
    <div className="chat">
      <button ref={launcher} className="chat-launch" hidden={open} aria-label={c.launcherAria} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(true)}>
          <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 8 Q5 4 9 4 H31 Q35 4 35 8 V24 Q35 28 31 28 H16 L8 35 V28 Q5 28 5 24 Z" fill="currentColor" /><circle cx="13" cy="16" r="2.6" fill="var(--garnet)" /><circle cx="20" cy="16" r="2.6" fill="var(--garnet)" /><circle cx="27" cy="16" r="2.6" fill="var(--garnet)" /></svg>
          {c.launcher}
        </button>
      {open && (
        <div ref={panel} id={panelId} className="chat-panel" role="dialog" aria-modal="false" aria-labelledby={titleId}
          onPointerEnter={() => document.body.classList.add('chat-hover')}
          onPointerLeave={() => document.body.classList.remove('chat-hover')}>
          <div className="chat-head">
            <div><h2 id={titleId}>{c.title}</h2><p>{c.subtitle}</p></div>
            <button className="chat-x" onClick={close} aria-label={c.close}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div ref={log} className="chat-log" role="log" aria-live="polite" aria-busy={busy}>
            <div className="msg bot">{c.greeting}</div>
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'me' : 'bot'}${m.error ? ' err' : ''}`}>
                {m.role === 'user' ? m.content : m.content ? <BotText text={m.content} /> : <span className="dots" aria-label={c.thinking}><i /><i /><i /></span>}
              </div>
            ))}
            {msgs.length === 0 && (
              <div className="chips" role="group" aria-label={c.suggestionsAria}>
                {c.suggestions.map(s => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <label htmlFor={inputId} className="sr-only">{c.inputLabel}</label>
            <input ref={field} id={inputId} value={input} onChange={e => setInput(e.target.value)} placeholder={c.placeholder}
              maxLength={c.maxChars} autoComplete="off" enterKeyHint="send" />
            <button className="chat-send" type="submit" disabled={busy || !input.trim()}>{c.send}</button>
            {left <= 60 && <span className="chat-left" aria-live="polite">{fill(c.charsLeft, { n: left })}</span>}
          </form>
        </div>
      )}
    </div>
  );
}

/** Plain text with line breaks (via CSS pre-wrap). Only allowlisted URLs/emails become links (see links.ts).
    Everything is rendered as text nodes or <a>, so no HTML from the model is ever injected. */
function BotText({ text }: { text: string }) {
  // The model sometimes answers in markdown: drop bold markers and turn "* " / "- " list markers into bullets.
  const clean = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^(\s*)[*-]\s+/gm, '$1• ');
  return (
    <>
      {linkify(clean).map((t, i) => t.type === 'text' ? t.text : (
        <a key={i} href={t.href} {...(t.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>{t.text}</a>
      ))}
    </>
  );
}
