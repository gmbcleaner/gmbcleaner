import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Resources',
  description:
    'GMBCLEANER blog — expert guides, tips, and resources on Google Maps review management, fake review identification, reputation protection, and online review policies.',
  keywords: [
    'review management blog',
    'Google Maps review tips',
    'fake review identification',
    'online reputation guide',
    'review policy resources',
  ],
  openGraph: {
    title: 'Blog & Resources | GMBCLEANER',
    description:
      'Expert guides and resources on Google Maps review management and fake review identification.',
    url: 'https://gmbcleaner.online/blog',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
