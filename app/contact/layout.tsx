import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | GMBCLEANER',
  description:
    'Get in touch with the GMBCLEANER team. We respond to all inquiries within 24 hours. Whether you have questions about our service, pricing, or want to discuss your specific situation — we are here to help.',
  openGraph: {
    title: 'Contact | GMBCLEANER',
    description:
      'Get in touch with our team. We respond within 24 hours.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
