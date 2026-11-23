import { describe, expect, it } from 'vitest';
import { buildAllowlist, distance, linkify, type Token } from './links';
import { ALLOWED_EMAILS, ALLOWED_URLS } from './link-allowlist.generated';

const links = (ts: Token[]) => ts.filter(t => t.type === 'link');
const plain = (ts: Token[]) => ts.map(t => t.text).join('');

describe('linkify (allowlist from profile.md + content.ts)', () => {
  it('links an exact match, keeping the text as written', () => {
    const t = linkify('Code: https://github.com/devashish-1305/repo2bench.');
    expect(links(t)).toEqual([{ type: 'link', text: 'https://github.com/devashish-1305/repo2bench', href: 'https://github.com/devashish-1305/repo2bench' }]);
    expect(plain(t)).toBe('Code: https://github.com/devashish-1305/repo2bench.'); // trailing period stays as text
  });

  it('treats scheme, case, www and trailing slash as the same link', () => {
    for (const v of ['github.com/devashish-1305/deal-radar', 'HTTPS://www.GitHub.com/devashish-1305/deal-radar/'])
      expect(links(linkify(v))[0]).toMatchObject({ href: 'https://github.com/devashish-1305/deal-radar' });
    expect(links(linkify('linkedin.com/in/devashish-dwivedi'))[0]).toMatchObject({ href: 'https://linkedin.com/in/devashish-dwivedi' });
  });

  it('corrects a misspelled GitHub link to the allowed version', () => {
    const t = linkify('See https://github.com/devshish-1305/deal-radar for the code.');
    expect(links(t)).toEqual([{ type: 'link', text: 'https://github.com/devashish-1305/deal-radar', href: 'https://github.com/devashish-1305/deal-radar', corrected: true }]);
    expect(plain(t)).toBe('See https://github.com/devashish-1305/deal-radar for the code.');
  });

  it('corrects a misspelled email to the allowed address', () => {
    const t = linkify('Email devashish.dwivedi13@gmial.com today.');
    expect(links(t)).toEqual([{ type: 'link', text: 'devashish.dwivedi.13@gmail.com', href: 'mailto:devashish.dwivedi.13@gmail.com', corrected: true }]);
  });

  it('links the exact email', () => {
    expect(links(linkify('Ask Devashish directly at devashish.dwivedi.13@gmail.com.'))).toEqual([
      { type: 'link', text: 'devashish.dwivedi.13@gmail.com', href: 'mailto:devashish.dwivedi.13@gmail.com' },
    ]);
  });

  it('leaves an unknown URL as plain text', () => {
    const t = linkify('Try https://evil.example/phish or kubernetes.io/docs now.');
    expect(links(t)).toEqual([]);
    expect(t).toEqual([{ type: 'text', text: 'Try https://evil.example/phish or kubernetes.io/docs now.' }]);
  });

  it('leaves URLs further than 3 edits away as plain text', () => {
    expect(links(linkify('https://github.com/devashish-1305/repo2bench/blob/main/README.md'))).toEqual([]);
    expect(links(linkify('https://github.com/someone-else/deal-radar'))).toEqual([]);
  });

  it('never turns HTML into markup: tags stay text, only allowlisted URLs inside become links', () => {
    const html = '<a href="https://evil.example">click</a><img src=x onerror="alert(1)"> <a href="https://github.com/devashish-1305/repo2bench">code</a>';
    const t = linkify(html);
    expect(plain(t)).toBe(html); // every character survives as text, nothing is dropped or interpreted
    expect(t.every(x => x.type === 'text' || x.type === 'link')).toBe(true);
    expect(links(t)).toEqual([{ type: 'link', text: 'https://github.com/devashish-1305/repo2bench', href: 'https://github.com/devashish-1305/repo2bench' }]);
    expect(links(t).some(l => l.href.includes('evil'))).toBe(false);
  });

  it('does not correct when two allowed entries are equally close (ambiguous)', () => {
    const allow = buildAllowlist(['https://example.com/aaa', 'https://example.com/aab'], []);
    expect(links(linkify('https://example.com/aac', allow))).toEqual([]);
  });

  it('allowlist is built from profile.md and content.ts', () => {
    expect(ALLOWED_URLS).toContain('https://github.com/devashish-1305/deal-radar');
    expect(ALLOWED_URLS).toContain('https://invoice-decision-agent.onrender.com/');
    expect(ALLOWED_EMAILS).toEqual(['devashish.dwivedi.13@gmail.com']);
  });

  it('distance is Levenshtein', () => {
    expect(distance('devshish', 'devashish')).toBe(1);
    expect(distance('kitten', 'sitting')).toBe(3);
  });
});
