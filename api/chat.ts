// Vercel serverless function: POST /api/chat. Logic lives in server/chat.ts (shared with `npm run dev`).
import { clientIp, handleChat } from '../server/chat.js';

const handle = (request: Request) => handleChat(request, { env: process.env, ip: clientIp(request) });

export const POST = handle;
export const GET = handle; // answers 405
