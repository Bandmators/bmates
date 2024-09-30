import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://Bandmators.github.io/sitemap.xml',
    host: 'https://Bandmators.github.io',
  };
}
