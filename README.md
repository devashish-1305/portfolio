# Devashish Dwivedi: the pass between the idea and the goal

My interactive portfolio. I'm an AI builder who sits between business and engineering: I turn what people mean into AI systems that ship, and make sure they hold up once they're live.

**Live:** https://devashish.vercel.app

## What's on the site
- **The pass:** how I work, shown as a ball moving from your idea to a shipped goal: listen, translate, build, prove.
- **Career:** a race timeline from my first internship to owning three production ML and LLM systems.
- **Projects:** each told as the idea, the pass and the goal, with live demos and code.
- **Research:** a pre-registered quant study on insider-buying clusters, with an interactive chart.
- **Off the clock:** football, F1, tennis, running, music and storytelling, and where each shows up in my work.
- **Ask me:** a chatbot that answers questions about my work, grounded only in my profile.
- **Full time:** a scoreboard that counts what you did on the page, then how to reach me.

## The chatbot
The model proposes, deterministic code decides.
- Answers only from `content/profile.md`, which is bundled at build time.
- Streams from Groq (`gpt-oss-120b`), falling back to `gpt-oss-20b` if the main model is busy.
- Links in replies are checked against an allowlist built from the profile. Near-misses are corrected and anything unknown is shown as plain text.
- Same-origin only, a per-IP rate limit, length limits, and no secrets in the browser bundle.

## Tech
Vite, React, TypeScript, plain CSS, Vercel serverless functions, Groq and Vercel Analytics. Lighthouse scores 100 across Performance, Accessibility, Best Practices and SEO on mobile and desktop.

## Run it locally
```bash
npm install
echo "GROQ_API_KEY=your_key" > .env.local
npm run dev        # http://localhost:5173
npm test
npm run build
```

## Environment variables
| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq key for the chatbot (server only) |
| `SITE_URL` | Canonical site URL, default `https://devashish.vercel.app` |
| `GROQ_MODEL`, `GROQ_FALLBACK_MODEL` | Optional model overrides |
| `ALLOWED_ORIGINS` | Optional extra origins allowed to call `/api/chat` |

## Editing content
All page text lives in `src/content.ts`. What the chatbot knows lives in `content/profile.md`.

## Contact
devashish.dwivedi.13@gmail.com · [LinkedIn](https://linkedin.com/in/devashish-dwivedi) · [GitHub](https://github.com/devashish-1305)
