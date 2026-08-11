'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, SectionHeading, CTABanner } from '@/components/shared/sections';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import {
  Stethoscope,
  Dumbbell,
  Hotel,
  Wrench,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  Lightbulb,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

const caseStudies = [
  {
    icon: Stethoscope,
    industry: 'Healthcare',
    businessType: 'Dental Clinic',
    challenge:
      'A dental clinic with a strong local reputation was hit by a wave of fake reviews from non-patients. Their rating dropped from 4.6 to 2.8 over six weeks, causing a significant decline in new patient bookings.',
    approach:
      'Our analysts reviewed the clinic\'s entire review profile, identifying 47 reviews with no patient records, duplicate content patterns, and accounts created within the same 48-hour window. Each was documented with screenshots and matched to specific Google review policy violations before submission through official reporting tools.',
    outcome:
      'Of the 47 disputed reviews, 31 were successfully removed by Google after policy review. The clinic\'s rating recovered from 2.8 to 4.6 over the following three months, and new patient inquiries returned to pre-attack levels.',
    stats: {
      before: { rating: '2.8', label: 'Star Rating' },
      after: { rating: '4.6', label: 'Star Rating' },
      identified: 47,
      disputed: 31,
      successRate: '66%',
    },
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Dumbbell,
    industry: 'Fitness',
    businessType: 'Fitness Franchise',
    challenge:
      'A multi-location fitness franchise was targeted by a coordinated review bombing campaign, likely orchestrated by a competitor. Over 60 fake 1-star reviews appeared across three locations within one week, all from accounts with no check-in history.',
    approach:
      'We identified the coordinated pattern — reviews shared similar language, were posted in rapid succession, and came from accounts with no prior activity. Each review was individually documented with evidence of the coordinated attack pattern and submitted as a bulk policy violation report.',
    outcome:
      '62 spam reviews were reported through official channels. 48 were removed by the platform after review. The franchise\'s aggregate rating stabilized and the coordinated attack pattern was flagged for platform-level monitoring.',
    stats: {
      before: { rating: '3.2', label: 'Aggregate Rating' },
      after: { rating: '4.3', label: 'Aggregate Rating' },
      identified: 62,
      disputed: 48,
      successRate: '77%',
    },
    color: 'from-sky-500 to-sky-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Hotel,
    industry: 'Hospitality',
    businessType: 'Hotel Group',
    challenge:
      'A boutique hotel group noticed an influx of reviews that violated platform content policies — including off-topic rants, abusive language, and personally identifiable information about staff members. These reviews were not necessarily fake, but they clearly violated published platform guidelines.',
    approach:
      'We assessed each review against the platform\'s specific content policies, documenting exact policy violations: prohibited language, off-topic content, and personal information disclosures. Each dispute case was tailored to the specific policy term being violated.',
    outcome:
      '23 reviews were disputed with detailed policy violation documentation. 19 were resolved — either removed or edited by the platform to comply with content guidelines. The hotel group\'s review profile became cleaner and more representative of actual guest experiences.',
    stats: {
      before: { rating: '3.7', label: 'Star Rating' },
      after: { rating: '4.4', label: 'Star Rating' },
      identified: 23,
      disputed: 19,
      successRate: '83%',
    },
    color: 'from-teal-500 to-sky-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Wrench,
    industry: 'Automotive',
    businessType: 'Auto Repair Shop',
    challenge:
      'An independent auto repair shop received a mix of reviews after a pricing dispute with a customer. Some were genuine negative feedback about the experience, while others were fake reviews from the customer\'s associates. The owner needed to address the fakes without suppressing legitimate criticism.',
    approach:
      'We carefully separated the reviews into two categories: 15 fake reviews from non-customers with no transaction history, and 8 genuine negative reviews from actual customers. We only prepared dispute cases for the 15 fake reviews, and advised the owner to respond professionally to the 8 genuine reviews.',
    outcome:
      'Of the 15 fake reviews disputed, 11 were removed. The 8 genuine negative reviews remained, but the owner\'s professional responses demonstrated accountability. The shop\'s rating stabilized at 4.1 — not artificially inflated, but no longer dragged down by fake reviews.',
    stats: {
      before: { rating: '3.4', label: 'Star Rating' },
      after: { rating: '4.1', label: 'Star Rating' },
      identified: 15,
      disputed: 11,
      successRate: '73%',
    },
    color: 'from-sky-500 to-teal-500',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
];

const summaryStats = [
  { value: '147', label: 'Reviews Disputed', sublabel: 'Across all case studies' },
  { value: '109', label: 'Successfully Resolved', sublabel: 'Through official channels' },
  { value: '74%', label: 'Average Success Rate', sublabel: 'Platform-dependent outcomes' },
  { value: '4', label: 'Industries Served', sublabel: 'Healthcare, fitness, hospitality, automotive' },
];

export default function CaseStudiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Results"
          title={
            <>
              Real negative review removal outcomes for{' '}
              <span className="gradient-text">Google Maps</span>
            </>
          }
          description="Anonymized case studies showing how businesses used our compliant dispute process to remove fake, spam, and policy-violating negative reviews from their Google Maps listings."
        />

        {/* Summary Stats */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryStats.map((stat, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card className="border border-slate-200 shadow-card text-center h-full">
                    <CardContent className="p-6">
                      <div className="text-3xl md:text-4xl font-bold gradient-text">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-navy-900">{stat.label}</div>
                      <div className="mt-1 text-xs text-navy-400">{stat.sublabel}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Case Study Cards */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {caseStudies.map((cs, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <Card className="overflow-hidden border border-slate-200 shadow-card hover:shadow-card hover:border-teal-200 transition-all duration-300">
                    {/* Card header */}
                    <div className={`bg-gradient-to-r ${cs.color} px-6 py-6 md:px-8 md:py-8`}>
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                          <cs.icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                            {cs.industry}
                          </span>
                          <h2 className="text-xl md:text-2xl font-bold text-white">
                            {cs.businessType}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left: Challenge & Approach */}
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700">
                                Challenge
                              </h3>
                            </div>
                            <p className="text-navy-600 leading-relaxed text-sm">{cs.challenge}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="h-5 w-5 text-teal-600" />
                              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700">
                                Approach
                              </h3>
                            </div>
                            <p className="text-navy-600 leading-relaxed text-sm">{cs.approach}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="h-5 w-5 text-sky-600" />
                              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700">
                                Outcome
                              </h3>
                            </div>
                            <p className="text-navy-600 leading-relaxed text-sm">{cs.outcome}</p>
                          </div>
                        </div>

                        {/* Right: Before/After Stats */}
                        <div className="lg:col-span-1">
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 h-full">
                            <div className="flex items-center gap-2 mb-5">
                              <BarChart3 className="h-5 w-5 text-navy-600" />
                              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-700">
                                Impact
                              </h3>
                            </div>

                            {/* Before / After */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                                  <span className="text-xs font-medium text-navy-400">Before</span>
                                </div>
                                <div className="text-2xl font-bold text-navy-700">
                                  {cs.stats.before.rating}
                                </div>
                                <div className="text-xs text-navy-400 mt-0.5">
                                  {cs.stats.before.label}
                                </div>
                              </div>
                              <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
                                  <span className="text-xs font-medium text-teal-600">After</span>
                                </div>
                                <div className="text-2xl font-bold gradient-text">
                                  {cs.stats.after.rating}
                                </div>
                                <div className="text-xs text-teal-600 mt-0.5">
                                  {cs.stats.after.label}
                                </div>
                              </div>
                            </div>

                            {/* Dispute stats */}
                            <div className="mt-4 space-y-2.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-navy-500">Reviews identified</span>
                                <span className="font-bold text-navy-900">{cs.stats.identified}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-navy-500">Successfully disputed</span>
                                <span className="font-bold text-teal-600">{cs.stats.disputed}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                                <span className="text-navy-500">Success rate</span>
                                <span className="font-bold gradient-text">{cs.stats.successRate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-2 border-amber-200 bg-amber-50/30">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
                      <ShieldAlert className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">Important Disclaimer</h3>
                      <p className="mt-2 text-sm text-navy-600 leading-relaxed">
                        Results vary by case. We do not guarantee specific outcomes. These case
                        studies are anonymized and shared for illustrative purposes only. Every
                        dispute is subject to the platform&apos;s own review process, and outcomes
                        depend on factors outside our control, including the platform&apos;s
                        policies, the specific evidence available, and the decisions of their review
                        teams. What we guarantee is that every case is thoroughly researched,
                        properly documented, and submitted through the correct official channels.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Want to remove negative reviews from your Google Maps listing?"
          description="Every situation is unique. Talk to our team about your Google Maps listing, and we will give you an honest assessment of what can and cannot be addressed through official channels."
          primaryHref="/signup"
          primaryLabel="Get Started"
          secondaryHref="/contact"
          secondaryLabel="Talk to Us"
        />
      </main>
      <Footer />
    </>
  );
}
