'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, CTABanner } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import {
  UserPlus,
  Wallet,
  Link2,
  BellRing,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create Your Account',
    description:
      'Sign up with your email and business information. It takes less than two minutes — no credit card required, no subscription commitment. Your account gives you access to our dashboard where you manage all your dispute cases.',
    details: [
      'Email-based signup with secure authentication',
      'Add your business name and Google Maps listing URL',
      'No credit card required to create an account',
      'No subscription — you only pay for cases you submit',
    ],
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Wallet,
    number: '02',
    title: 'Add Funds to Your Wallet',
    description:
      'Load your wallet with the balance you want to spend. The minimum deposit is $20. Each review dispute case costs $1.00 plus a $0.15 service fee — $1.15 total per case. You are always in control of your spending.',
    details: [
      'Minimum deposit: $20.00',
      'Cost per case: $1.00 + $0.15 service fee = $1.15',
      'Secure payment processing via Stripe',
      'Wallet balance never expires — use it anytime',
    ],
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Link2,
    number: '03',
    title: 'Submit Review URLs',
    description:
      'Paste the URLs of reviews you believe violate platform policies. Our analysts review each submission, assess it against the platform’s policies, and file a dispute through official channels if the review is likely in violation.',
    details: [
      'Paste review URLs directly into your dashboard',
      'Our analysts review each submission within 24 hours',
      'We assess each review against specific platform policies',
      'Disputes are filed through official platform channels only',
    ],
    color: 'from-teal-500 to-sky-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: BellRing,
    number: '04',
    title: 'Track & Get Notified',
    description:
      'Monitor the status of every case from your dashboard. You receive notifications when a platform takes action, when a case needs follow-up, and when a final decision is made. Full transparency from submission to resolution.',
    details: [
      'Real-time status updates on every case',
      'Email notifications when platforms take action',
      'Full case history with documentation',
      'Automatic follow-up submissions when appropriate',
    ],
    color: 'from-sky-500 to-teal-500',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="How It Works"
          title={
            <>
              Four steps from signup to{' '}
              <span className="gradient-text">cleaner reviews</span>
            </>
          }
          description="Our process is designed to be simple, transparent, and fully compliant with platform policies. Here is exactly what happens when you work with GMBCLEANER."
        />

        {/* Timeline Steps */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-sky-300 to-teal-300 md:-translate-x-1/2" />

              <div className="space-y-12 md:space-y-24">
                {steps.map((step, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div
                      className={`relative flex flex-col md:flex-row gap-8 ${
                        i % 2 === 1 ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-8 md:left-1/2 top-6 -translate-x-1/2 z-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-teal-400 shadow-card">
                          <step.icon className="h-7 w-7 text-teal-600" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`pl-24 md:pl-0 md:w-1/2 ${i % 2 === 1 ? 'md:pr-16' : 'md:pl-16'}`}>
                        <Card className="border border-slate-200 hover:shadow-card transition-all duration-300 group h-full">
                          <div className={`h-1.5 bg-gradient-to-r ${step.color} rounded-t-lg`} />
                          <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-4xl font-bold text-slate-200 group-hover:text-teal-200 transition-colors">
                                {step.number}
                              </span>
                              <h3 className="text-xl font-bold text-navy-900">
                                {step.title}
                              </h3>
                            </div>
                            <p className="text-navy-500 leading-relaxed">
                              {step.description}
                            </p>
                            <ul className="mt-6 space-y-2.5">
                              {step.details.map((detail, di) => (
                                <li key={di} className="flex items-start gap-2.5">
                                  <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-navy-600">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Spacer for the other half */}
                      <div className="hidden md:block md:w-1/2" />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick summary cards */}
        <section className="py-20 bg-navy-900 relative overflow-hidden">
          <FloatingShape className="top-10 left-1/4 w-72 h-72" variant="teal" />
          <FloatingShape className="bottom-10 right-1/4 w-72 h-72" variant="sky" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-balance">
                The whole process at a glance
              </h2>
              <p className="mt-4 text-lg text-navy-300">
                From signup to resolution, here is what to expect at each stage.
              </p>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="rounded-2xl bg-navy-800/50 border border-white/10 backdrop-blur-sm p-6 hover:border-teal-400/30 transition-all duration-300">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.iconBg}`}>
                      <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                    </div>
                    <div className="mt-4 text-sm font-bold text-teal-400">
                      Step {step.number}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-navy-300 leading-relaxed">
                      {step.description.split('.')[0]}.
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What to expect */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-0 shadow-card overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy-900">
                    What to expect after you submit a case
                  </h2>
                  <p className="mt-3 text-navy-500 leading-relaxed">
                    Once you submit a review URL, here is what happens behind the scenes:
                  </p>
                  <div className="mt-8 space-y-6">
                    {[
                      { time: 'Within 24 hours', text: 'Our analysts review your submission and assess it against the relevant platform’s policies.' },
                      { time: '1–3 business days', text: 'If the review likely violates policy, we file a dispute through the platform’s official reporting channels.' },
                      { time: '3–14 business days', text: 'The platform’s review team evaluates the dispute. Some cases resolve quickly; others take longer.' },
                      { time: 'Ongoing', text: 'You receive status updates throughout the process. If a case is denied, we may recommend follow-up actions or alternative approaches.' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border-2 border-teal-200 text-teal-600 font-bold text-sm flex-shrink-0">
                            {i + 1}
                          </div>
                          {i < 3 && <div className="w-0.5 h-full bg-teal-100 mt-2" />}
                        </div>
                        <div className="pb-6">
                          <div className="text-sm font-bold text-teal-600">{item.time}</div>
                          <p className="mt-1 text-navy-600 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800 leading-relaxed">
                      <strong>Important:</strong> We do not guarantee that any review will be
                      removed. Outcomes depend entirely on the platform’s review team and their
                      interpretation of their own policies. Our job is to give your case the
                      best possible chance by submitting a well-documented dispute through the
                      correct channels.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Ready to get started?"
          description="Create your account in under two minutes. Add funds when you are ready. Submit your first case today."
          primaryHref="/signup"
          primaryLabel="Create Your Account"
          secondaryHref="/pricing"
          secondaryLabel="See Pricing Details"
        />
      </main>
      <Footer />
    </>
  );
}
