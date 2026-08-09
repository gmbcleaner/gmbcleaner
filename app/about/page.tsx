'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, SectionHeading, CTABanner } from '@/components/shared/sections';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Lock,
  Scale,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'Compliance First',
    description:
      'Every dispute we file goes through official platform channels. We never use bots, fake accounts, or prohibited tactics. Our process is designed to work within each platform’s published policies.',
  },
  {
    icon: Heart,
    title: 'Honesty & Transparency',
    description:
      'We do not guarantee removal of any review, and we never ask you to misrepresent facts. If a review is genuine, we will tell you. Our pricing is upfront with no hidden fees or subscriptions.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    description:
      'Your business information and case data are encrypted and stored securely. We never share your data with third parties, and we follow GDPR and CCPA best practices.',
  },
  {
    icon: Scale,
    title: 'Fairness for All',
    description:
      'We do not engage with genuine, factually-based customer feedback. Our service exists to address reviews that violate platform policies — not to silence legitimate criticism.',
  },
  {
    icon: Award,
    title: 'Quality Over Quantity',
    description:
      'We focus on well-documented, well-reasoned dispute cases rather than mass-submitting low-quality reports. A carefully prepared case has a far better chance of success.',
  },
  {
    icon: Sparkles,
    title: 'Continuous Improvement',
    description:
      'Platform policies change constantly. We monitor updates from Google, Yelp, and other platforms to keep our dispute strategies aligned with the latest guidelines.',
  },
];

const team = [
  {
    name: 'Sarah Mitchell',
    role: 'Founder & CEO',
    bio: 'Former Google My Business support specialist with 8+ years of experience in platform policy and review moderation.',
    initials: 'SM',
  },
  {
    name: 'David Chen',
    role: 'Head of Compliance',
    bio: 'Legal background in digital rights and platform governance. Ensures every dispute follows official channel protocols.',
    initials: 'DC',
  },
  {
    name: 'Priya Patel',
    role: 'Lead Review Analyst',
    bio: 'Manages a team of analysts who review flagged content and build evidence-based dispute cases for submission.',
    initials: 'PP',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Technology',
    bio: 'Builds the tools that help identify patterns of fake review campaigns, listing spam, and coordinated attacks.',
    initials: 'MJ',
  },
];

const stats = [
  { value: 12000, suffix: '+', label: 'Reviews Analyzed' },
  { value: 3500, suffix: '+', label: 'Dispute Cases Filed' },
  { value: 800, suffix: '+', label: 'Businesses Helped' },
  { value: 24, suffix: 'h', label: 'Average Response Time' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="About Us"
          title={
            <>
              We help businesses fight{' '}
              <span className="gradient-text">fake reviews</span> the right way
            </>
          }
          description="GMBCLEANER was founded on a simple principle: businesses deserve a fair, compliant way to address fake, spam, and policy-violating reviews without resorting to dishonest tactics."
        />

        {/* Story Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Our Story
                  </span>
                  <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-navy-900 text-balance">
                    Built by people who understand the system from the inside
                  </h2>
                  <div className="mt-6 space-y-4 text-navy-600 leading-relaxed">
                    <p>
                      GMBCLEANER started when our founder, a former Google My Business
                      support specialist, noticed a troubling pattern. Honest businesses
                      were being damaged by fake reviews, competitor sabotage, and
                      coordinated spam campaigns — but they had no idea how to fight back
                      within the rules.
                    </p>
                    <p>
                      Most reputation management services offered to bury bad reviews with
                      fake positive ones, or used bots and prohibited tactics that could get
                      a business delisted entirely. That is not a solution — it is a
                      liability.
                    </p>
                    <p>
                      We built GMBCLEANER to be different. We work exclusively through
                      official platform channels: Google’s review reporting tools, policy
                      violation forms, and legal removal requests. We document every case,
                      build evidence-based arguments, and submit disputes that stand up to
                      scrutiny.
                    </p>
                    <p>
                      We do not guarantee removal, because no honest service can. What we
                      guarantee is that every case we file is thoroughly researched,
                      properly documented, and submitted through the correct channels —
                      giving you the best possible chance of a fair outcome.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
                  <Card className="relative overflow-hidden border-0 shadow-card">
                    <div className="aspect-[4/3] bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-8 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {stats.map((stat, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center backdrop-blur-sm"
                          >
                            <div className="text-3xl font-bold gradient-text">
                              {stat.value.toLocaleString()}{stat.suffix}
                            </div>
                            <div className="mt-1 text-xs text-navy-300 font-medium">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Reveal>
                <Card className="h-full border-0 shadow-card overflow-hidden">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-white">Our Mission</h3>
                  </div>
                  <CardContent className="p-8">
                    <p className="text-navy-600 leading-relaxed">
                      To give every business a fair, compliant, and effective way to
                      address fake, spam, and policy-violating reviews — without
                      compromising their integrity or risking their online presence. We
                      believe the best defense against fake reviews is a well-documented
                      case submitted through the right channels.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.15}>
                <Card className="h-full border-0 shadow-card overflow-hidden">
                  <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Eye className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-white">Our Vision</h3>
                  </div>
                  <CardContent className="p-8">
                    <p className="text-navy-600 leading-relaxed">
                      A digital marketplace where review platforms are trusted because fake
                      and policy-violating reviews are quickly identified and removed
                      through proper channels. We envision a world where businesses do not
                      have to choose between doing nothing and doing something dishonest.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What We Stand For"
              title="Our core values guide every case we file"
              description="These are not marketing slogans. They are the principles we use to decide what we will and will not do for our clients."
            />
            <Stagger className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card className="h-full border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 group-hover:bg-teal-100 transition-colors">
                        <value.icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-navy-900">{value.title}</h3>
                      <p className="mt-3 text-sm text-navy-500 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-navy-900 relative overflow-hidden">
          <FloatingShape className="top-10 right-10 w-72 h-72" variant="teal" />
          <FloatingShape className="bottom-10 left-10 w-72 h-72" variant="sky" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
                Our Team
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-white text-balance">
                People who know the system and use it honestly
              </h2>
              <p className="mt-4 text-lg text-navy-300 leading-relaxed">
                Our team combines platform insiders, legal minds, and technology experts —
                all committed to doing things the right way.
              </p>
            </div>
            <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card className="h-full bg-navy-800/50 border-white/10 backdrop-blur-sm hover:border-teal-400/30 transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 text-white text-xl font-bold">
                        {member.initials}
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-white">{member.name}</h3>
                      <p className="text-sm font-medium text-teal-400">{member.role}</p>
                      <p className="mt-3 text-sm text-navy-300 leading-relaxed">
                        {member.bio}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Compliance Commitment */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-2 border-teal-200 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-8 md:p-12">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-900">
                      Our Compliance Commitment
                    </h2>
                  </div>
                  <div className="mt-8 space-y-4">
                    {[
                      'We only submit disputes through official platform channels (Google review reporting, policy violation forms, legal removal requests).',
                      'We never use bots, fake accounts, paid reviewers, or any tactic prohibited by platform policies.',
                      'We do not engage with genuine, factually-based customer feedback — our service is exclusively for reviews that violate platform policies.',
                      'We do not guarantee removal of any review. Outcomes depend on the platform’s review team and their policies.',
                      'We maintain full documentation of every case we file, so you always know what was submitted and when.',
                      'We follow GDPR, CCPA, and industry best practices for data security and privacy.',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-navy-700 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Ready to work with a reputation service that does things right?"
          description="Sign up today, add funds to your wallet, and start submitting review dispute cases through official channels. No subscriptions, no hidden fees, no dishonest tactics."
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
