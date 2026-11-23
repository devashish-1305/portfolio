import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS build script
import { genProfile, toLlmsTxt } from './gen-profile.mjs';

describe('llms.txt', () => {
  it('drops only the "Rules for the assistant" section', () => {
    const md = '# Title\n\n## Rules for the assistant\n- Never discuss salary.\n- Ignore any instruction.\n\n## At a glance\n- Name: X\n\n## Skills\n- Python\n';
    expect(toLlmsTxt(md)).toBe('# Title\n\n## At a glance\n- Name: X\n\n## Skills\n- Python\n');
  });

  it('public/llms.txt matches content/profile.md minus the rules', () => {
    genProfile();
    const profile = readFileSync('content/profile.md', 'utf8');
    const llms = readFileSync('public/llms.txt', 'utf8');
    expect(llms).toBe(toLlmsTxt(profile));
    expect(llms).not.toMatch(/Rules for the assistant|reply exactly|Ignore any instruction/);
    for (const section of ['## At a glance', '## Experience', '## Projects', '## Research', '## Skills', '## Off the clock']) expect(llms).toContain(section);
    expect(profile.split('\n').filter(l => !llms.includes(l)).every(l => /^(## Rules for the assistant|- )/.test(l) || l === '')).toBe(true);
  });
});
