import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the GMBCLEANER team. We respond to all inquiries within 24 hours. Whether you have questions about our Google Maps review removal service, pricing, or want to discuss your specific situation — we are here to help.',
  keywords: [
    'contact GMBCLEANER',
    'review removal support',
    'Google Maps review help',
    'reputation management contact',
  ],
  openGraph: {
    title: 'Contact Us | GMBCLEANER',
    description:
      'Get in touch with our team. We respond within 24 hours.',
    url: 'https://gmbcleaner.online/contact',
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
