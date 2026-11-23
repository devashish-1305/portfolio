/* Head tags (title, description, canonical, Open Graph, Twitter, JSON-LD) plus robots.txt and sitemap.xml,
   all built from src/content.ts and the SITE_URL env var, so the domain can change without code changes. */
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { seo, site } from '../src/content.ts';
import { resolveSiteUrl } from '../src/siteUrl.ts';


export function headTags(siteUrl: string): HtmlTagDescriptor[] {
  const url = siteUrl + '/';
  const image = siteUrl + seo.ogImage;
  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' });
  const link = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'link', attrs, injectTo: 'head' });
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: seo.person.jobTitle,
    url,
    email: `mailto:${site.email}`,
    image,
    address: { '@type': 'PostalAddress', addressLocality: seo.person.locality, addressCountry: seo.person.country },
    sameAs: [site.links.linkedin.href, site.links.github.href],
  };
  return [
    { tag: 'title', children: seo.title, injectTo: 'head' },
    meta({ name: 'description', content: seo.description }),
    meta({ name: 'theme-color', content: seo.themeColor }),
    link({ rel: 'canonical', href: url }),
    link({ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }),
    link({ rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' }),
    link({ rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }),
    meta({ property: 'og:type', content: 'website' }),
    meta({ property: 'og:site_name', content: site.name }),
    meta({ property: 'og:title', content: seo.title }),
    meta({ property: 'og:description', content: seo.description }),
    meta({ property: 'og:url', content: url }),
    meta({ property: 'og:image', content: image }),
    meta({ property: 'og:image:width', content: '1200' }),
    meta({ property: 'og:image:height', content: '630' }),
    meta({ property: 'og:image:alt', content: seo.ogImageAlt }),
    meta({ property: 'og:locale', content: 'en_IN' }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    meta({ name: 'twitter:title', content: seo.title }),
    meta({ name: 'twitter:description', content: seo.description }),
    meta({ name: 'twitter:image', content: image }),
    meta({ name: 'twitter:image:alt', content: seo.ogImageAlt }),
    // "<" escaped so nothing in the data can close the script tag.
    { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(person).replace(/</g, '\\u003c'), injectTo: 'head' },
  ];
}

export const robotsTxt = (siteUrl: string) => `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

export const sitemapXml = (siteUrl: string, lastmod = new Date().toISOString().slice(0, 10)) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n</urlset>\n`;

export function seoPlugin(getEnv: () => Record<string, string | undefined>): Plugin {
  let siteUrl = '';
  return {
    name: 'seo',
    configResolved() { siteUrl = resolveSiteUrl(getEnv()); },
    transformIndexHtml() { return headTags(siteUrl); },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/robots.txt') { res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end(robotsTxt(siteUrl)); }
        if (req.url === '/sitemap.xml') { res.setHeader('Content-Type', 'application/xml; charset=utf-8'); return res.end(sitemapXml(siteUrl)); }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl) });
    },
  };
}
