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

export default function HomePage() {
  return (
    <>
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
