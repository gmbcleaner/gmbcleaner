'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Clock, Headphones, BadgeCheck } from 'lucide-react';
import { SectionHeading } from '@/components/shared/sections';
import { Stagger, staggerItem } from '@/components/animation/reveal';

const benefits = [
  {
    icon: Shield,
    title: 'Google Maps Focused',
    desc: 'We specialize in removing negative reviews from Google Maps listings. Every dispute targets Google\'s review policies.',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Security',
    desc: 'Your account, data, and transactions are protected with encrypted connections and secure authentication.',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    desc: 'See the status of every case in real-time. Know exactly what was submitted, when, and what the outcome is.',
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    desc: 'Most cases are reviewed and submitted within 24-72 hours. You stay informed throughout the process.',
  },
  {
    icon: Headphones,
    title: 'Responsive Support',
    desc: 'Our support team is available through the ticket system. Get help when you need it, without the wait.',
  },
  {
    icon: BadgeCheck,
    title: 'No Refund Policy',
    desc: 'All sales are final. You pay for the dispute service — not for guaranteed removal. We are upfront about this.',
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Built for trust, designed for results"
          description="We combine compliance, transparency, and technology to deliver a reputation management service you can rely on."
        />
        <Stagger className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={staggerItem}
                className="group rounded-2xl bg-white border border-slate-100 p-6 shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 group-hover:bg-teal-50 transition-colors">
                  <Icon className="h-6 w-6 text-navy-700 group-hover:text-teal-600 transition-colors" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{benefit.title}</h3>
                <p className="mt-2 text-sm text-navy-500 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
