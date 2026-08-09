import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Login',
  description:
    'Log in to your GMBCLEANER account to manage review dispute cases, track submissions, and monitor your wallet balance.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
