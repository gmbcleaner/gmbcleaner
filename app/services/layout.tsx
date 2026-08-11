import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'GMBCLEANER services — Google Maps negative review removal, review dispute submission, reputation management, and business review moderation. Professional, compliant, platform-channel review removal.',
  keywords: [
    'Google Maps review removal',
    'negative review removal service',
    'review dispute submission',
    'reputation management service',
    'business review moderation',
    'fake review reporting',
  ],
  openGraph: {
    title: 'Services | GMBCLEANER',
    description:
      'Professional Google Maps negative review removal, review dispute, and reputation management services.',
    url: 'https://gmbcleaner.online/services',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
