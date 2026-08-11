'use client';

import { motion } from 'framer-motion';
import { Search, FileWarning, Send, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/shared/sections';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';

const services = [
  {
    icon: Search,
    title: 'Review Identification',
    desc: 'We analyze your Google Maps reviews to identify fake, spam, abusive, and policy-violating negative reviews.',
  },
  {
    icon: FileWarning,
    title: 'Policy Assessment',
    desc: 'Each negative review is evaluated against Google\'s published content policies to determine dispute eligibility.',
  },
  {
    icon: Send,
    title: 'Dispute Submission',
    desc: 'We submit formal disputes through Google\'s official review reporting channels with full documentation.',
  },
  {
    icon: TrendingUp,
    title: 'Status Tracking',
    desc: 'Track the status of every case in real-time from your dashboard until Google reaches a decision.',
  },
];

export function ServiceSummary() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Do"
          title="How we remove negative Google Maps reviews"
          description="A proven 4-step process to identify, assess, dispute, and track the removal of fake and policy-violating negative reviews from your Google Maps listing."
        />
        <Stagger className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={staggerItem}
                className="group relative rounded-2xl bg-white border border-slate-100 p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/50 to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 shadow-glow">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-4 text-xs font-semibold text-teal-600 uppercase tracking-wider">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-navy-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-navy-500 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </Stagger>
        <Reveal delay={0.3} className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Explore all services <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
