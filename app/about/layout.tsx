import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about GMBCLEANER — a professional Google Maps review management and dispute service. We help businesses identify, report, and request removal of fake, spam, or policy-violating reviews.',
  keywords: [
    'about GMBCLEANER',
    'Google Maps review removal service',
    'review management company',
    'fake review reporting service',
    'business reputation management',
  ],
  openGraph: {
    title: 'About Us | GMBCLEANER',
    description:
      'Professional Google Maps review management and dispute service. Learn how we help businesses remove fake and policy-violating reviews.',
    url: 'https://gmbcleaner.online/about',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
