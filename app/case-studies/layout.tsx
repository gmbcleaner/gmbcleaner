import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies & Results',
  description:
    'See real GMBCLEANER results — Google Maps review removal outcomes, dispute success stories, and how businesses reclaimed their online reputation from fake and policy-violating reviews.',
  keywords: [
    'review removal results',
    'Google Maps review dispute outcomes',
    'fake review removal success',
    'GMBCLEANER case studies',
    'business reputation recovery',
  ],
  openGraph: {
    title: 'Case Studies & Results | GMBCLEANER',
    description:
      'Real review removal outcomes and dispute success stories. See how businesses recovered their Google Maps reputation.',
    url: 'https://gmbcleaner.online/case-studies',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/case-studies',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
