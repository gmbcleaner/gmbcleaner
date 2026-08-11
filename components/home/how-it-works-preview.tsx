'use client';

import { motion } from 'framer-motion';
import { UserPlus, Wallet, FileText, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeading } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';
import { fetchCollection } from '@/lib/db';

const DEFAULT_MIN = 20;

export function HowItWorksPreview() {
  const [min, setMin] = useState(DEFAULT_MIN);

  useEffect(() => {
    fetchCollection('pricing_settings').then((data) => {
      if (data && data.length > 0) {
        setMin(data[0].min_deposit ?? DEFAULT_MIN);
      }
    }).catch(() => {});
  }, []);

  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      desc: 'Sign up in seconds and get your unique user ID and dashboard.',
    },
    {
      icon: Wallet,
      title: 'Add Funds',
      desc: `Fund your wallet with crypto. Minimum deposit is $${min.toFixed(2)}.`,
    },
    {
      icon: FileText,
      title: 'Submit Review URLs',
      desc: 'Add one or more negative review URLs you want removed. Pay from your balance.',
    },
    {
      icon: Bell,
      title: 'Track & Get Notified',
      desc: 'Watch status updates in real-time and receive completion notifications.',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From signup to resolution in 4 steps"
          description="A simple, transparent process that keeps you informed at every stage."
        />
        <div className="mt-16 relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-200 via-sky-200 to-teal-200" />
          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 0.15}>
                  <div className="relative text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card"
                    >
                      <Icon className="h-7 w-7 text-teal-600" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </motion.div>
                    <h3 className="mt-5 text-lg font-semibold text-navy-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-navy-500 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
        <Reveal delay={0.4} className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all"
          >
            See the Full Process
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
