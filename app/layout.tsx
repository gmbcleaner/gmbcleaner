import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gmbcleaner.com'),
  title: {
    default: 'GMBCLEANER — Reputation Management & Review Dispute Service',
    template: '%s | GMBCLEANER',
  },
  description:
    'GMBCLEANER helps businesses identify, report, and request removal of fake, spam, abusive, or policy-violating reviews. A compliant, transparent reputation management service.',
  keywords: [
    'reputation management',
    'fake review reporting',
    'Google Maps review dispute',
    'business review cleanup',
    'online reputation support',
    'review moderation service',
  ],
  authors: [{ name: 'GMBCLEANER' }],
  creator: 'GMBCLEANER',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gmbcleaner.com',
    siteName: 'GMBCLEANER',
    title: 'GMBCLEANER — Reputation Management & Review Dispute Service',
    description:
      'Identify, report, and request removal of fake, spam, or policy-violating reviews with a compliant, transparent reputation management service.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GMBCLEANER — Reputation Management & Review Dispute Service',
    description:
      'Identify, report, and request removal of fake, spam, or policy-violating reviews with a compliant reputation management service.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
