import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { HeroSection } from '@/components/home/hero';
import { TrustBar } from '@/components/home/trust-bar';
import { ServiceSummary } from '@/components/home/service-summary';
import { HowItWorksPreview } from '@/components/home/how-it-works-preview';
import { BenefitsGrid } from '@/components/home/benefits-grid';
import { BeforeAfterSection } from '@/components/home/before-after';
import { TestimonialSlider } from '@/components/home/testimonial-slider';
import { FAQPreview } from '@/components/home/faq-preview';
import { BlogPreview } from '@/components/home/blog-preview';
import { CTABanner } from '@/components/shared/sections';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GMBCLEANER - Remove Negative Google Maps Reviews | Professional Review Dispute Service',
  description:
    'GMBCLEANER helps businesses remove negative, fake, spam, and policy-violating Google Maps reviews. Professional review dispute service — sign up, fund wallet, submit dispute in minutes.',
  keywords: [
    'remove negative Google Maps reviews',
    'Google Maps review removal service',
    'fake review removal Google Maps',
    'negative review dispute',
    'Google Business review management',
    'spam review removal',
    'online reputation management',
    'review moderation service',
    'Google Maps reputation repair',
  ],
  openGraph: {
    title: 'GMBCLEANER - Remove Negative Google Maps Reviews',
    description:
      'Professional Google Maps review removal service. Remove fake, spam, and policy-violating reviews in minutes.',
    url: 'https://gmbcleaner.online',
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
  alternates: {
    canonical: 'https://gmbcleaner.online',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <ServiceSummary />
        <HowItWorksPreview />
        <BenefitsGrid />
        <BeforeAfterSection />
        <TestimonialSlider />
        <FAQPreview />
        <BlogPreview />
        <CTABanner
          title="Ready to remove negative reviews from your Google Maps listing?"
          description="Sign up today, fund your wallet, and start submitting negative review dispute cases in minutes. No subscriptions, no hidden fees."
          primaryHref="/signup"
          primaryLabel="Create Your Account"
          secondaryHref="/contact"
          secondaryLabel="Talk to Our Team"
        />
      </main>
      <Footer />
    </>
  );
}
