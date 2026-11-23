import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';
// @ts-expect-error plain JS build script
import { genProfile } from './scripts/gen-profile.mjs';

/** Keeps server/profile.generated.ts in sync with content/profile.md, and serves /api/chat under `npm run dev`
    with the same handler Vercel runs in production. The key is read from .env.local on the server side only. */
function chatApi(): Plugin {
  return {
    name: 'chat-api',
    buildStart() { genProfile(); },
    configureServer(server) {
      genProfile();
      server.watcher.add('content/profile.md');
      server.watcher.on('change', f => { if (f.endsWith('content/profile.md')) genProfile(); });

      const env = loadEnv(server.config.mode, process.cwd(), ''); // not exposed to the client (no VITE_ prefix)
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const { handleChat } = await server.ssrLoadModule('/server/chat.ts');
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
          const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : undefined;
          const request = new Request(`http://${req.headers.host}${req.originalUrl ?? '/api/chat'}`, { method: req.method, headers, body });
          const response: Response = await handleChat(request, { env, ip: req.socket.remoteAddress ?? 'dev' });
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (response.body) for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
          res.end();
        } catch (e) {
          server.config.logger.error('[chat] dev handler failed: ' + (e as Error).message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'The assistant is offline at the moment.' }));
        }
      });
    },
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', c => { data += c; if (data.length > 64_000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default defineConfig({
  plugins: [react(), chatApi()],
});
