import { seo } from './content.ts';

/** The site's public URL (no trailing slash), from the SITE_URL env var or the default in content.ts.
    Used by the head tags / sitemap (scripts/seo-plugin.ts). The API has its own copy in server/chat.ts so it never imports src/. */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  return (env.SITE_URL || seo.defaultSiteUrl).trim().replace(/\/+$/, '');
}
