import { afterEach, describe, expect, it, vi } from 'vitest';
import { allowedOrigins, handleChat, originAllowed } from './chat';
import { chat } from '../src/content';

const ORIGIN = 'http://localhost:5174';
let n = 0;
const call = (env: Record<string, string> = { GROQ_API_KEY: 'test-key' }) => handleChat(
  new Request(ORIGIN + '/api/chat', { method: 'POST', headers: { Origin: ORIGIN, Host: 'localhost:5174', 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) }),
  { env, ip: `test-${++n}`, dev: true },
);
const sse = (text: string) => new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`)); c.close(); } }), { status: 200 });
const status = (s: number) => new Response('{"error":{"message":"upstream detail org_123"}}', { status: s, headers: s === 429 ? { 'retry-after': '7' } : {} });

/** Stubs fetch with one response per model; records which models were called. */
function groq(byModel: Record<string, () => Response>) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    const model = JSON.parse(init.body as string).model as string;
    calls.push(model);
    return byModel[model]();
  }));
  return calls;
}
afterEach(() => { vi.unstubAllGlobals(); vi.spyOn(console, 'error').mockRestore(); });
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('model fallback', () => {
  it('uses only the main model when it answers', async () => {
    const calls = groq({ 'openai/gpt-oss-120b': () => sse('from 120b') });
    const r = await call();
    expect([r.status, await r.text(), calls]).toEqual([200, 'from 120b', ['openai/gpt-oss-120b']]);
  });

  it('retries once on the fallback model after a 429', async () => {
    const calls = groq({ 'openai/gpt-oss-120b': () => status(429), 'openai/gpt-oss-20b': () => sse('from 20b') });
    const r = await call();
    expect([r.status, await r.text(), calls]).toEqual([200, 'from 20b', ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']]);
  });

  it('retries once on the fallback model after a 5xx', async () => {
    const calls = groq({ 'openai/gpt-oss-120b': () => status(503), 'openai/gpt-oss-20b': () => sse('from 20b') });
    const r = await call();
    expect([r.status, await r.text(), calls.length]).toEqual([200, 'from 20b', 2]);
  });

  it('shows "busy" only when both models fail', async () => {
    const calls = groq({ 'openai/gpt-oss-120b': () => status(429), 'openai/gpt-oss-20b': () => status(429) });
    const r = await call();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: chat.errors.busy });
    expect(r.headers.get('retry-after')).toBe('7');
    expect(calls.length).toBe(2);
  });

  it('shows "down" when both fail with server errors, never upstream details', async () => {
    groq({ 'openai/gpt-oss-120b': () => status(500), 'openai/gpt-oss-20b': () => status(502) });
    const r = await call();
    const body = await r.text();
    expect(r.status).toBe(502);
    expect(body).toBe(JSON.stringify({ error: chat.errors.down }));
    expect(body).not.toContain('org_');
  });

  it('does not retry a 4xx such as a bad key', async () => {
    const calls = groq({ 'openai/gpt-oss-120b': () => status(401), 'openai/gpt-oss-20b': () => sse('should not run') });
    const r = await call();
    expect([r.status, calls]).toEqual([502, ['openai/gpt-oss-120b']]);
  });

  it('honours GROQ_MODEL and GROQ_FALLBACK_MODEL', async () => {
    const calls = groq({ 'model-a': () => status(429), 'model-b': () => sse('from b') });
    const r = await call({ GROQ_API_KEY: 'k', GROQ_MODEL: 'model-a', GROQ_FALLBACK_MODEL: 'model-b' });
    expect([await r.text(), calls]).toEqual(['from b', ['model-a', 'model-b']]);
  });

  it('never switches model once text has started: a mid-stream failure ends with the cut-off note', async () => {
    const calls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => {
      calls.push(JSON.parse(init.body as string).model);
      return new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"He built"}}]}\n\n')); setTimeout(() => c.error(new Error('reset')), 5); } }), { status: 200 });
    }));
    const r = await call();
    expect(await r.text()).toBe('He built\n\n' + chat.errors.cutOff);
    expect(calls).toEqual(['openai/gpt-oss-120b']);
  });
});

describe('origin allowlist', () => {
  // What Vercel provides at runtime on a preview deployment, plus SITE_URL set in the project settings.
  const vercel = {
    SITE_URL: 'https://devashish.dev/',
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'devashish-portfolio-abc123-deva.vercel.app',
    VERCEL_BRANCH_URL: 'devashish-portfolio-git-main-deva.vercel.app',
    VERCEL_PROJECT_PRODUCTION_URL: 'devashish.vercel.app',
  };

  it('allows SITE_URL and the Vercel preview, branch and production domains', () => {
    for (const o of ['https://devashish.dev', 'https://devashish-portfolio-abc123-deva.vercel.app', 'https://devashish-portfolio-git-main-deva.vercel.app', 'https://devashish.vercel.app'])
      expect(originAllowed(o, vercel), o).toBe(true);
    expect([...allowedOrigins(vercel)].sort()).toEqual([
      'https://devashish-portfolio-abc123-deva.vercel.app',
      'https://devashish-portfolio-git-main-deva.vercel.app',
      'https://devashish.dev',
      'https://devashish.vercel.app',
    ]);
  });

  it('rejects everything else in production, including localhost and look-alikes', () => {
    for (const o of ['http://localhost:5173', 'http://127.0.0.1:4173', 'https://evil.example', 'https://devashish.dev.evil.example',
      'https://evil-devashish.vercel.app', 'http://devashish.dev', 'https://devashish.dev:8443', 'null', '', 'not a url'])
      expect(originAllowed(o, { ...vercel, VERCEL_ENV: 'production' }), o).toBe(false);
    expect(originAllowed(null, vercel)).toBe(false);
  });

  it('falls back to the default site URL when SITE_URL is unset', () => {
    expect(originAllowed('https://devashish.vercel.app', {})).toBe(true);
    expect(originAllowed('https://devashish.dev', {})).toBe(false);
  });

  it('accepts extra origins from ALLOWED_ORIGINS', () => {
    expect(originAllowed('https://www.devashish.dev', { ALLOWED_ORIGINS: 'https://www.devashish.dev, https://staging.devashish.dev' })).toBe(true);
  });

  it('allows localhost only in dev (Vite middleware or `vercel dev`)', () => {
    for (const o of ['http://localhost:5173', 'http://127.0.0.1:4173', 'http://[::1]:5173']) {
      expect(originAllowed(o, {}, { dev: true }), o).toBe(true);
      expect(originAllowed(o, { VERCEL_ENV: 'development' }), o).toBe(true);
      expect(originAllowed(o, {}), o).toBe(false);
    }
    expect(originAllowed('https://evil.example', {}, { dev: true })).toBe(false);
  });

  it('handleChat returns 403 for a foreign origin even if the Host header matches it', async () => {
    const r = await handleChat(new Request('https://evil.example/api/chat', {
      method: 'POST', headers: { Origin: 'https://evil.example', Host: 'evil.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    }), { env: { ...vercel, GROQ_API_KEY: 'k' }, ip: 'origin-test' });
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ error: chat.errors.forbidden });
  });

  it('handleChat accepts the production domain', async () => {
    groq({ 'openai/gpt-oss-120b': () => sse('ok') });
    const r = await handleChat(new Request('https://devashish.vercel.app/api/chat', {
      method: 'POST', headers: { Origin: 'https://devashish.vercel.app', 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    }), { env: { ...vercel, GROQ_API_KEY: 'k' }, ip: 'origin-test-2' });
    expect([r.status, await r.text()]).toEqual([200, 'ok']);
  });
});
