import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign Up',
  description:
    'Create your GMBCLEANER account to start identifying, reporting, and disputing fake or policy-violating Google Maps reviews. No subscriptions, no hidden fees.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
