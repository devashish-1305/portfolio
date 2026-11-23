// Vercel serverless function: POST /api/chat. Logic lives in server/chat.ts (shared with `npm run dev`).
// Runs as native Node ESM on Vercel, so relative imports carry explicit .js extensions. The handler is loaded
// lazily so that if loading ever fails, the reason is logged and the visitor still gets a clean JSON error.
type Handler = typeof import('../server/chat.js');
let mod: Promise<Handler> | null = null;

async function handle(request: Request): Promise<Response> {
  let m: Handler;
  try {
    m = await (mod ??= import('../server/chat.js'));
  } catch (e) {
    mod = null;
    const err = e as { name?: string; code?: string };
    console.error(`[chat] handler failed to load: ${err.name ?? 'Error'}${err.code ? ` (${err.code})` : ''}`);
    return new Response(JSON.stringify({ error: 'The assistant is offline at the moment.' }), {
      status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return m.handleChat(request, { env: process.env, ip: m.clientIp(request) });
}

export const POST = handle;
export const GET = handle; // answers 405
