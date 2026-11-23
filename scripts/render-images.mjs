// Renders the SVG sources to the PNGs in public/ using a local Chrome (no browser download).
// Usage: npm run render:images   (set CHROME_PATH if Chrome isn't in the default macOS location)
import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const jobs = [
  { src: 'assets/og-image.svg', out: 'public/og-image.png', w: 1200, h: 630 },
  { src: 'public/favicon.svg', out: 'public/favicon-32.png', w: 32, h: 32, transparent: true },
  { src: 'assets/apple-touch-icon.svg', out: 'public/apple-touch-icon.png', w: 180, h: 180 },
];

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files'] });
try {
  for (const j of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(root + j.src).href, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: root + j.out, omitBackground: !!j.transparent, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    console.log(`${j.src} -> ${j.out} (${j.w}x${j.h})`);
    await page.close();
  }
} finally {
  await browser.close();
}
