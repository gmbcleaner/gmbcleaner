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
    title: 'Google Maps Review Identification',
    description:
      'Our analysts examine your Google Maps listing to identify negative reviews that may violate Google\u2019s policies — including fake reviews, competitor sabotage, coordinated spam campaigns, and reviews from non-customers.',
    features: [
      'Pattern analysis for coordinated review bombing on Google Maps',
      'Detection of negative reviews with no transaction history',
      'Identification of competitor-authored negative reviews',
      'Flagging of reviews containing prohibited content',
    ],
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: ClipboardCheck,
    title: 'Google Policy Assessment',
    description:
      'Each flagged negative review is assessed against Google\u2019s published review policies. We determine which exact policy terms may have been violated and build a case around those specific violations.',
    features: [
      'Review against Google\u2019s review policies and guidelines',
      'Assessment of content policy violations',
      'Documentation of specific policy violations',
      'Evidence compilation with screenshots and timestamps',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Send,
    title: 'Dispute Submission to Google',
    description:
      'We submit dispute cases through Google\u2019s official review reporting tools — policy violation forms and legal removal request forms. Every submission is documented and tracked.',
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
      'Once a dispute is submitted to Google, we track its status through the review process. You receive updates at every stage — from initial review to final decision.',
    features: [
      'Real-time status updates on every case',
      'Notifications when Google takes action',
      'Follow-up submissions when appropriate',
      'Complete case history and audit trail',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Eye,
    title: 'Google Maps Monitoring',
    description:
      'We continuously monitor your Google Maps listing so you can catch new fake or policy-violating negative reviews early — before they damage your reputation and local search rankings.',
    features: [
      'Continuous monitoring of your Google Maps listing',
      'Alert notifications for new suspicious negative reviews',
      'Weekly reputation health reports',
      'Trend analysis and benchmark tracking',
    ],
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Shield,
    title: 'Ongoing Review Moderation',
    description:
      'For businesses with active Google Maps profiles, we provide ongoing moderation support — identifying problematic negative reviews as they appear and preparing dispute cases on your behalf.',
    features: [
      'Ongoing Google Maps review profile moderation',
      'Pre-screening of new negative reviews for policy violations',
      'Automated flagging of suspicious patterns',
      'Monthly moderation summary reports',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
];

const process = [
  { step: '01', title: 'Identify', description: 'We scan your Google Maps reviews and flag potential policy violations.' },
  { step: '02', title: 'Assess', description: 'Each flagged negative review is matched against Google\u2019s specific policies.' },
  { step: '03', title: 'Submit', description: 'We file disputes through Google\u2019s official reporting channels.' },
  { step: '04', title: 'Track', description: 'You get status updates until Google reaches a final decision.' },
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
              Professional negative review removal for{' '}
              <span className="gradient-text">Google Maps</span>
            </>
          }
          description="Every service we offer is focused on removing fake, spam, and policy-violating negative reviews from your Google Maps listing through official channels."
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

        <CTABanner
          title="Ready to remove negative Google Maps reviews?"
          description="Create an account, add funds, and start submitting negative review dispute cases today. You only pay for the cases you submit — no subscriptions, no commitments."
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
