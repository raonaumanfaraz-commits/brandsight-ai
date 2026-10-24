import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://brandsight-ai.coderao.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/*', '/api/', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
