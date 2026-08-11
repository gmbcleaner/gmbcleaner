'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, SectionHeading, CTABanner } from '@/components/shared/sections';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';
import { Counter } from '@/components/animation/counter';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { fetchCollection } from '@/lib/db';
import {
  CheckCircle2,
  Search,
  ClipboardCheck,
  Send,
  Activity,
  Eye,
  Shield,
  Wallet,
  TrendingUp,
} from 'lucide-react';

const DEFAULT_PRICE = 1.00;
const DEFAULT_FEE = 0.15;
const DEFAULT_MIN = 20;

const includedItems = [
  {
    icon: Search,
    title: 'Review Evaluation',
    description: 'Each review is examined by our analysts to determine if it may violate platform policies.',
  },
  {
    icon: ClipboardCheck,
    title: 'Policy Assessment',
    description: 'We match flagged reviews against specific platform policy terms and document violations.',
  },
  {
    icon: Send,
    title: 'Dispute Submission',
    description: 'We file your dispute case through official platform channels with full documentation.',
  },
  {
    icon: Activity,
    title: 'Status Tracking',
    description: 'Real-time updates on every case from submission through final platform decision.',
  },
  {
    icon: Eye,
    title: 'Evidence Compilation',
    description: 'Screenshots, timestamps, and pattern analysis compiled into a clear dispute case.',
  },
  {
    icon: Shield,
    title: 'Compliance Guarantee',
    description: 'Every dispute follows official platform protocols — no bots, no fake accounts, no prohibited tactics.',
  },
  {
    icon: TrendingUp,
    title: 'Follow-Up Support',
    description: 'If a platform requests additional information, we prepare and submit follow-up documentation.',
  },
  {
    icon: Wallet,
    title: 'Wallet-Based Billing',
    description: 'Fund your wallet once and pay per case. No recurring charges, no commitments, no surprises.',
  },
];

const pricingFaqs = [
  {
    question: 'How does the per-case pricing work?',
    answer:
      'Each review dispute case costs $1.00 plus a $0.15 service fee, for a total of $1.15 per item. You fund your wallet with a minimum deposit of $20, and each case you submit deducts $1.15 from your balance. There are no subscriptions or recurring fees — you only pay for the cases you actually submit.',
  },
  {
    question: 'Why is there a service fee on top of the base price?',
    answer:
      'The service fee covers payment processing, platform maintenance, and case management infrastructure. It keeps the base case price low and transparent while ensuring we can maintain secure systems, comply with data protection regulations, and provide reliable status tracking for every dispute.',
  },
  {
    question: 'What happens if my wallet balance runs out mid-case?',
    answer:
      'You need sufficient balance before submitting a new case. If your balance is too low, you will be prompted to add funds before the case is submitted. Cases already in progress are not affected — they continue through the platform review process regardless of your wallet balance.',
  },
  {
    question: 'Do I get a refund if a review is not removed?',
    answer:
      'No. We charge for the preparation and submission of dispute cases, not for the outcome. Platform decisions are outside our control, and we do not guarantee removal of any review. All sales are final — no refunds will be issued under any circumstances.',
  },
];

export default function PricingPage() {
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [fee, setFee] = useState(DEFAULT_FEE);
  const [min, setMin] = useState(DEFAULT_MIN);

  useEffect(() => {
    fetchCollection('pricing_settings').then((data) => {
      if (data && data.length > 0) {
        const p = data[0];
        setPrice(p.base_price ?? DEFAULT_PRICE);
        setFee(p.service_fee ?? DEFAULT_FEE);
        setMin(p.min_deposit ?? DEFAULT_MIN);
      }
    }).catch(() => {});
  }, []);

  const total = price + fee;

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Pricing"
          title={
            <>
              Transparent <span className="gradient-text">pay-as-you-go</span> pricing
            </>
          }
          description={`No subscriptions. No hidden fees. No commitments. You fund your wallet and pay only for the negative review dispute cases you submit — $${total.toFixed(2)} per item, every time.`}
        />

        {/* Main Pricing Card */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Pricing Card */}
              <Reveal className="lg:col-span-3">
                <Card className="relative overflow-hidden border-0 shadow-card">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl" />
                  <div className="relative">
                    {/* Header band */}
                    <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-8 py-10 md:px-10 md:py-12">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-500">
                          <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Per-Case Pricing</h2>
                          <p className="text-sm text-navy-300">Pay only for what you submit</p>
                        </div>
                      </div>
                    </div>

                    {/* Price display */}
                    <CardContent className="p-8 md:p-10">
                      <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm font-medium text-navy-400">Base Price</p>
                          <div className="mt-2 text-4xl md:text-5xl font-bold text-navy-900">
                            <Counter value={price} prefix="$" decimals={2} />
                          </div>
                          <p className="mt-1 text-xs text-navy-400">per review case</p>
                        </div>
                        <div className="sm:border-x border-slate-200">
                          <p className="text-sm font-medium text-navy-400">Service Fee</p>
                          <div className="mt-2 text-4xl md:text-5xl font-bold text-navy-900">
                            <Counter value={fee} prefix="$" decimals={2} />
                          </div>
                          <p className="mt-1 text-xs text-navy-400">per item</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-teal-600">Total Per Item</p>
                          <div className="mt-2 text-4xl md:text-5xl font-bold gradient-text">
                            <Counter value={total} prefix="$" decimals={2} />
                          </div>
                          <p className="mt-1 text-xs text-navy-400">all-inclusive</p>
                        </div>
                      </div>

                      {/* Breakdown table */}
                      <div className="mt-8 rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-3 text-sm font-semibold text-navy-700 bg-slate-50 px-6 py-3">
                          <span>Component</span>
                          <span className="text-center">Amount</span>
                          <span className="text-right">Description</span>
                        </div>
                        <div className="grid grid-cols-3 text-sm text-navy-600 px-6 py-3.5 border-t border-slate-100">
                          <span className="font-medium">Base price</span>
                          <span className="text-center font-semibold text-navy-900">${price.toFixed(2)}</span>
                          <span className="text-right text-navy-500">Review evaluation & dispute preparation</span>
                        </div>
                        <div className="grid grid-cols-3 text-sm text-navy-600 px-6 py-3.5 border-t border-slate-100">
                          <span className="font-medium">Service fee</span>
                          <span className="text-center font-semibold text-navy-900">${fee.toFixed(2)}</span>
                          <span className="text-right text-navy-500">Processing & platform maintenance</span>
                        </div>
                        <div className="grid grid-cols-3 text-sm px-6 py-3.5 border-t border-slate-200 bg-teal-50/50">
                          <span className="font-bold text-navy-900">Total per item</span>
                          <span className="text-center font-bold gradient-text">${total.toFixed(2)}</span>
                          <span className="text-right text-navy-500">Charged per dispute case submitted</span>
                        </div>
                      </div>

                      {/* Minimum deposit */}
                      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 flex-shrink-0">
                          <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900">
            Minimum deposit: <span className="gradient-text">${min.toFixed(2)}</span>
                          </p>
                          <p className="text-xs text-navy-500 mt-0.5">
                            Fund your wallet once. Each submitted case deducts ${total.toFixed(2)}. Top up anytime.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Reveal>

              {/* Side info */}
              <div className="lg:col-span-2 space-y-6">
                <Reveal delay={0.1}>
                  <Card className="border border-slate-200 shadow-card">
                    <CardContent className="p-8">
                      <h3 className="text-lg font-bold text-navy-900">No subscriptions</h3>
                      <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                        We do not charge monthly fees. You only pay when you submit a dispute case.
                        If you do not use the service in a given month, you pay nothing.
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={0.15}>
                  <Card className="border border-slate-200 shadow-card">
                    <CardContent className="p-8">
                      <h3 className="text-lg font-bold text-navy-900">No hidden fees</h3>
                      <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                        The price you see is the price you pay. ${total.toFixed(2)} per item, every time. No setup
                        fees, no per-platform surcharges, no minimum monthly spend.
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal delay={0.2}>
                  <Card className="border border-slate-200 shadow-card">
                    <CardContent className="p-8">
                      <h3 className="text-lg font-bold text-navy-900">Wallet-based billing</h3>
                      <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                        Deposit funds into your wallet using cryptocurrency (USDT, USDC, BTC). Each
                        case you submit is deducted automatically. Your balance never expires.
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What's Included"
              title="Everything you get with every dispute case"
              description={`Each $${total.toFixed(2)} case includes the full end-to-end service — from initial evaluation through final platform decision tracking.`}
            />
            <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {includedItems.map((item, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card className="h-full border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all duration-300 group bg-white">
                    <CardContent className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 group-hover:bg-teal-100 transition-colors">
                        <item.icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-navy-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-navy-500 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Quick checklist banner */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-2 border-teal-200 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-navy-900">Every case includes</h2>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {[
                      'Manual review by a trained analyst',
                      'Policy violation documentation',
                      'Evidence compilation with screenshots',
                      'Official channel submission',
                      'Real-time status tracking',
                      'Follow-up documentation if requested',
                      'Complete case audit trail',
                      'No outcome-based charges',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-navy-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Pricing FAQ */}
        <section className="py-20 bg-navy-900 relative overflow-hidden">
          <FloatingShape className="top-10 right-10 w-72 h-72" variant="teal" />
          <FloatingShape className="bottom-10 left-10 w-72 h-72" variant="sky" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
                Pricing FAQ
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-white text-balance">
                Common pricing questions
              </h2>
              <p className="mt-4 text-lg text-navy-300 leading-relaxed">
                Everything you need to know about how billing works.
              </p>
            </div>
            <Reveal delay={0.1}>
              <div className="mt-10 rounded-2xl bg-navy-800/50 border border-white/10 backdrop-blur-sm p-6 md:p-8">
                <Accordion type="single" collapsible className="w-full">
                  {pricingFaqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="border-white/10"
                    >
                      <AccordionTrigger className="text-left text-white hover:no-underline text-base font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-navy-300 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Ready to remove negative Google Maps reviews?"
          description={`Create your account, fund your wallet with a minimum $${min.toFixed(2)} deposit, and submit your first negative review dispute case today. No subscriptions, no commitments.`}
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
