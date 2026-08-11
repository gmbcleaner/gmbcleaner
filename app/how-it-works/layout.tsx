import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how GMBCLEANER works — sign up, fund your wallet, submit a review dispute, and track the outcome. Simple 4-step process to remove negative Google Maps reviews.',
  keywords: [
    'how GMBCLEANER works',
    'review removal process',
    'submit review dispute',
    'Google Maps review removal steps',
    'wallet-based review service',
  ],
  openGraph: {
    title: 'How It Works | GMBCLEANER',
    description:
      'Simple 4-step process: sign up, fund wallet, submit dispute, track outcome. Remove negative Google Maps reviews.',
    url: 'https://gmbcleaner.online/how-it-works',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/how-it-works',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
