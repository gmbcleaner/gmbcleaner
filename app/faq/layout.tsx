import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about GMBCLEANER — how the Google Maps review removal service works, pricing, payments, order processing, no-refund policy, and more.',
  keywords: [
    'GMBCLEANER FAQ',
    'review removal questions',
    'how to remove Google Maps reviews',
    'review dispute service questions',
    'crypto payment review service',
  ],
  openGraph: {
    title: 'FAQ | GMBCLEANER',
    description:
      'Answers to common questions about our Google Maps review removal service, pricing, and policies.',
    url: 'https://gmbcleaner.online/faq',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
