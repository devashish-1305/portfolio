import { seo } from './content';

/** The site's public URL (no trailing slash), from the SITE_URL env var or the default in content.ts.
    Shared by the head tags / sitemap (scripts/seo-plugin.ts) and the /api/chat origin allowlist (server/chat.ts). */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  return (env.SITE_URL || seo.defaultSiteUrl).trim().replace(/\/+$/, '');
}
