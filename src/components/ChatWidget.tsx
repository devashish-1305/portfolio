import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { chat as c } from '../content';

// The panel (and its link checker) is a separate chunk, fetched the first time someone opens or hovers the launcher.
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

/** Floating "Ask me" button. The panel loads on first open and then stays mounted so the conversation survives closing. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false); // panel chunk has rendered
  const launcher = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const panelId = useId();

  // Give focus back to the launcher when the panel closes.
  useEffect(() => {
    if (!open && wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const close = () => { setOpen(false); document.body.classList.remove('chat-hover'); };

  // While the panel chunk is still loading, Esc cancels the open (afterwards the panel handles Esc itself).
  useEffect(() => {
    if (!open || ready) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, ready]);
  const show = () => { setLoaded(true); setOpen(true); };

  return (
    <div className="chat">
      <button ref={launcher} className="chat-launch" hidden={open && ready} aria-label={c.launcherAria} aria-expanded={open} aria-controls={panelId}
        onClick={show} onPointerEnter={() => void loadPanel()} onFocus={() => void loadPanel()}>
        <svg viewBox="0 0 40 40" width="22" height="22" aria-hidden="true"><path d="M5 8 Q5 4 9 4 H31 Q35 4 35 8 V24 Q35 28 31 28 H16 L8 35 V28 Q5 28 5 24 Z" fill="currentColor" /><circle cx="13" cy="16" r="2.6" fill="var(--garnet)" /><circle cx="20" cy="16" r="2.6" fill="var(--garnet)" /><circle cx="27" cy="16" r="2.6" fill="var(--garnet)" /></svg>
        {c.launcher}
      </button>
      {loaded && (
        <Suspense fallback={null}>
          <ChatPanel open={open} onClose={close} onReady={() => setReady(true)} panelId={panelId} />
        </Suspense>
      )}
    </div>
  );
}
