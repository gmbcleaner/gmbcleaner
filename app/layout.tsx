import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
  metadataBase: new URL('https://gmbcleaner.online'),
  title: {
    default: 'GMBCLEANER - Remove Negative Google Maps Reviews | Professional Review Dispute Service',
    template: '%s | GMBCLEANER',
  },
  description:
    'GMBCLEANER helps businesses identify, report, and request removal of fake, spam, abusive, or policy-violating Google Maps reviews. Professional, compliant reputation management through official platform channels.',
  keywords: [
    'remove negative Google Maps reviews',
    'Google Maps review removal service',
    'fake review removal',
    'review dispute service',
    'Google Business review management',
    'online reputation management',
    'review moderation service',
    'spam review removal',
    'Google Maps reputation repair',
    'business review cleanup',
  ],
  authors: [{ name: 'GMBCLEANER' }],
  creator: 'GMBCLEANER',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gmbcleaner.online',
    siteName: 'GMBCLEANER',
    title: 'GMBCLEANER - Remove Negative Google Maps Reviews',
    description:
      'Professional Google Maps review removal service. Remove fake, spam, and policy-violating reviews through official platform channels.',
    images: [
      {
        url: 'https://gmbcleaner.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GMBCLEANER - Remove Negative Google Maps Reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GMBCLEANER - Remove Negative Google Maps Reviews',
    description:
      'Professional Google Maps review removal service. Remove fake, spam, and policy-violating reviews.',
    images: ['https://gmbcleaner.online/og-image.png'],
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JDZH54EFHE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JDZH54EFHE');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
