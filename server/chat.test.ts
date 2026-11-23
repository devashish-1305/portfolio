import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleChat } from './chat';
import { chat } from '../src/content';

const ORIGIN = 'http://localhost:5174';
let n = 0;
const call = (env: Record<string, string> = { GROQ_API_KEY: 'test-key' }) => handleChat(
  new Request(ORIGIN + '/api/chat', { method: 'POST', headers: { Origin: ORIGIN, Host: 'localhost:5174', 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) }),
  { env, ip: `test-${++n}` },
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
