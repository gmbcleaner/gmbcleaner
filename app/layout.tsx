import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gmbcleaner.com'),
  title: {
    default: 'GMBCLEANER - Professional Review Management & Dispute Service',
    template: '%s | GMBCLEANER',
  },
  description:
    'GMBCLEANER helps businesses identify, report, and request removal of fake, spam, abusive, or policy-violating reviews. Professional, compliant reputation management through official platform channels.',
  keywords: [
    'reputation management',
    'fake review reporting',
    'Google Maps review dispute',
    'business review cleanup',
    'online reputation support',
    'review moderation service',
    'review dispute service',
    'fake review removal',
    'Google Business review management',
  ],
  authors: [{ name: 'GMBCLEANER' }],
  creator: 'GMBCLEANER',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gmbcleaner.com',
    siteName: 'GMBCLEANER',
    title: 'GMBCLEANER - Professional Review Management & Dispute Service',
    description:
      'Professional review management and dispute service. Identify, report, and request removal of fake, spam, or policy-violating reviews through official platform channels.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GMBCLEANER - Professional Review Management & Dispute Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GMBCLEANER - Professional Review Management & Dispute Service',
    description:
      'Professional review management and dispute service. Identify, report, and request removal of fake, spam, or policy-violating reviews.',
    images: ['/og-image.png'],
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
