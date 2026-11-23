/* Deterministic link check for bot replies.
   A URL or email in a reply becomes a link only if it matches the allowlist built from profile.md + content.ts.
   Within edit distance 3 of exactly one allowed entry, the correct allowed version is shown instead (fixes typos
   like "devshish-1305"). Anything else stays plain text. */

import { ALLOWED_EMAILS, ALLOWED_URLS } from './link-allowlist.generated';

export type Token = { type: 'text'; text: string } | { type: 'link'; text: string; href: string; corrected?: boolean };
type Entry = { kind: 'url' | 'email'; key: string; text: string; href: string };

export const MAX_DISTANCE = 3;

/** Comparison key: case-insensitive, scheme / "www." / trailing slash / "mailto:" ignored. */
export function normalize(s: string, kind: 'url' | 'email'): string {
  const v = s.trim().toLowerCase();
  if (kind === 'email') return v.replace(/^mailto:/, '');
  return v.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
}

export function buildAllowlist(urls: string[], emails: string[]): Entry[] {
  const byKey = new Map<string, Entry>();
  for (const u of urls) {
    const key = normalize(u, 'url');
    const hasScheme = /^https?:\/\//i.test(u);
    const entry: Entry = { kind: 'url', key, text: hasScheme ? u : `https://${u}`, href: hasScheme ? u : `https://${u}` };
    const prev = byKey.get('u:' + key);
    if (!prev || (hasScheme && !/^https?:\/\//i.test(prev.text))) byKey.set('u:' + key, entry);
  }
  for (const e of emails) {
    const key = normalize(e, 'email');
    byKey.set('e:' + key, { kind: 'email', key, text: key, href: `mailto:${key}` });
  }
  return [...byKey.values()];
}

const DEFAULT_ALLOWLIST = buildAllowlist(ALLOWED_URLS, ALLOWED_EMAILS);

/** Levenshtein distance, stopping early once it's clearly above `max`. */
export function distance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Resolves a candidate to an allowed entry: exact match, or the single entry within MAX_DISTANCE. */
export function resolve(candidate: string, kind: 'url' | 'email', allow: Entry[] = DEFAULT_ALLOWLIST): { entry: Entry; exact: boolean } | null {
  const key = normalize(candidate, kind);
  const same = allow.filter(e => e.kind === kind);
  const exact = same.find(e => e.key === key);
  if (exact) return { entry: exact, exact: true };
  const near = same.filter(e => distance(key, e.key, MAX_DISTANCE) <= MAX_DISTANCE);
  return near.length === 1 ? { entry: near[0], exact: false } : null;
}

// Emails first so "gmail.com" inside an address isn't read as a domain. Bare domains need a dot-separated host.
const CANDIDATE = /([a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})|(https?:\/\/[^\s<>"'`|)\]]+|www\.[^\s<>"'`|)\]]+|(?<![@\w./-])(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"'`|)\]]*)/gi;

/** Splits reply text into plain-text and link tokens. Never produces HTML: callers render tokens as text nodes / <a>. */
export function linkify(text: string, allow: Entry[] = DEFAULT_ALLOWLIST): Token[] {
  const out: Token[] = [];
  const push = (t: string) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (last?.type === 'text') last.text += t; else out.push({ type: 'text', text: t });
  };
  let pos = 0;
  for (const m of text.matchAll(CANDIDATE)) {
    let raw = m[0];
    const trail = raw.match(/[.,;:!?]+$/)?.[0] ?? '';
    if (trail) raw = raw.slice(0, -trail.length);
    const start = m.index!;
    push(text.slice(pos, start));
    const hit = resolve(raw, m[1] ? 'email' : 'url', allow);
    if (hit) out.push(hit.exact ? { type: 'link', text: raw, href: hit.entry.href } : { type: 'link', text: hit.entry.text, href: hit.entry.href, corrected: true });
    else push(raw);
    pos = start + raw.length;
  }
  push(text.slice(pos));
  return out;
}
