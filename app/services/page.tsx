'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, SectionHeading, CTABanner } from '@/components/shared/sections';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  ClipboardCheck,
  Send,
  Activity,
  Eye,
  Shield,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const services = [
  {
    icon: Search,
    title: 'Review Identification',
    description:
      'Our analysts examine your review profile to identify reviews that may violate platform policies — including fake reviews, competitor sabotage, coordinated spam campaigns, and reviews from non-customers.',
    features: [
      'Pattern analysis for coordinated review bombing',
      'Detection of reviews with no transaction history',
      'Identification of competitor-authored reviews',
      'Flagging of reviews containing prohibited content',
    ],
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: ClipboardCheck,
    title: 'Policy Assessment',
    description:
      'Each flagged review is assessed against the specific platform’s published policies. We determine which exact policy terms may have been violated and build a case around those specific violations.',
    features: [
      'Review against Google’s review policies and guidelines',
      'Assessment of Yelp, Facebook, and Trustpilot policies',
      'Documentation of specific policy violations',
      'Evidence compilation with screenshots and timestamps',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Send,
    title: 'Dispute Submission',
    description:
      'We submit dispute cases through official platform channels — Google’s review reporting tools, policy violation forms, and legal removal request forms. Every submission is documented and tracked.',
    features: [
      'Submission through Google review reporting tools',
      'Policy violation form submissions',
      'Legal removal requests where applicable',
      'Full documentation of every submission',
    ],
    color: 'from-teal-500 to-sky-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Activity,
    title: 'Status Tracking',
    description:
      'Once a dispute is submitted, we track its status through the platform’s review process. You receive updates at every stage — from initial review to final decision — so you always know where things stand.',
    features: [
      'Real-time status updates on every case',
      'Notifications when a platform takes action',
      'Follow-up submissions when appropriate',
      'Complete case history and audit trail',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Eye,
    title: 'Reputation Monitoring',
    description:
      'We continuously monitor your review profiles across major platforms so you can catch new fake or policy-violating reviews early — before they damage your reputation or search rankings.',
    features: [
      '24/7 monitoring across Google, Yelp, and Facebook',
      'Alert notifications for new suspicious reviews',
      'Weekly reputation health reports',
      'Trend analysis and benchmark tracking',
    ],
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Shield,
    title: 'Review Moderation',
    description:
      'For businesses with active review profiles, we provide ongoing moderation support — identifying problematic reviews as they appear and preparing dispute cases on your behalf.',
    features: [
      'Ongoing review profile moderation',
      'Pre-screening of new reviews for policy violations',
      'Automated flagging of suspicious patterns',
      'Monthly moderation summary reports',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
];

const process = [
  { step: '01', title: 'Identify', description: 'We scan your reviews and flag potential policy violations.' },
  { step: '02', title: 'Assess', description: 'Each flagged review is matched against specific platform policies.' },
  { step: '03', title: 'Submit', description: 'We file disputes through official platform channels.' },
  { step: '04', title: 'Track', description: 'You get status updates until a final decision is reached.' },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Our Services"
          title={
            <>
              Six ways we help you protect your{' '}
              <span className="gradient-text">online reputation</span>
            </>
          }
          description="Every service we offer works within official platform policies. No bots, no fake accounts, no prohibited tactics — just well-documented dispute cases submitted through the right channels."
        />

        {/* Services Grid */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="grid md:grid-cols-2 gap-8">
              {services.map((service, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card className="h-full border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all duration-300 overflow-hidden group">
                    <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.iconBg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <service.icon className={`h-7 w-7 ${service.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-navy-900">
                            {service.title}
                          </h3>
                          <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-6 space-y-2.5">
                        {service.features.map((feature, fi) => (
                          <li key={fi} className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-navy-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* How services fit together */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="How It Fits Together"
              title="Our services work as a complete system"
              description="You can use individual services as needed, or let us handle the full cycle from identification to tracking."
            />
            <div className="mt-12">
              <div className="grid md:grid-cols-4 gap-6 relative">
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-300 via-sky-300 to-teal-300" />
                {process.map((item, i) => (
                  <Reveal key={i} delay={i * 0.15}>
                    <div className="relative text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white border-2 border-teal-200 shadow-card relative z-10">
                        <span className="text-2xl font-bold gradient-text">{item.step}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-navy-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What we don't do */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-2 border-red-100 bg-red-50/30">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-navy-900">
                    What we will <span className="text-red-500">never</span> do
                  </h2>
                  <p className="mt-3 text-navy-500 leading-relaxed">
                    We believe in doing things the right way. These tactics can get your
                    business permanently suspended from review platforms — we refuse to
                    use them, no matter what.
                  </p>
                  <div className="mt-8 grid md:grid-cols-2 gap-4">
                    {[
                      'Write fake positive reviews to bury negative ones',
                      'Use bots or automated tools to mass-flag reviews',
                      'Create fake accounts to manipulate review scores',
                      'Pay third parties to write or remove reviews',
                      'Threaten or harass reviewers, even fake ones',
                      'Guarantee removal of any specific review',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 text-sm font-bold flex-shrink-0 mt-0.5">
                          ✕
                        </span>
                        <p className="text-sm text-navy-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Ready to put these services to work for your business?"
          description="Create an account, add funds, and start submitting dispute cases today. You only pay for the cases you submit — no subscriptions, no commitments."
          primaryHref="/signup"
          primaryLabel="Get Started Now"
          secondaryHref="/pricing"
          secondaryLabel="View Pricing"
        />
      </main>
      <Footer />
    </>
  );
}
