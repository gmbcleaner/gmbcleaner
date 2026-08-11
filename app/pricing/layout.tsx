import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'GMBCLEANER pricing — affordable, transparent, no-subscription review dispute service. Fund your wallet, pay per order. See our pricing, fees, and minimum deposit details.',
  keywords: [
    'GMBCLEANER pricing',
    'review removal cost',
    'Google Maps review dispute pricing',
    'pay per review removal',
    'affordable reputation management',
  ],
  openGraph: {
    title: 'Pricing | GMBCLEANER',
    description:
      'Transparent, pay-per-order pricing. No subscriptions. Fund your wallet and submit review disputes starting from $15.',
    url: 'https://gmbcleaner.online/pricing',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
