import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/provider',
          '/provider/',
          '/raihan',
          '/atik',
          '/login',
          '/signup',
          '/user-login',
        ],
      },
    ],
    sitemap: 'https://gmbcleaner.online/sitemap.xml',
  };
}
