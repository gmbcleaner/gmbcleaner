'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Lock, BarChart3, Star } from 'lucide-react';
import { FloatingShape } from '@/components/animation/floating';
import { Counter } from '@/components/animation/counter';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <FloatingShape className="top-20 -left-20 w-72 h-72" variant="teal" duration={8} />
      <FloatingShape className="top-40 right-0 w-96 h-96" variant="sky" duration={10} delay={1} />
      <FloatingShape className="bottom-0 left-1/3 w-80 h-80" variant="navy" duration={12} delay={2} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-sm font-medium text-teal-700">
              <ShieldCheck className="h-4 w-4" />
              Compliant Review Dispute Service
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 text-balance leading-[1.1]">
              Protect your business from{' '}
              <span className="gradient-text">fake & policy-violating reviews</span>
            </h1>
            <p className="mt-6 text-lg text-navy-500 leading-relaxed max-w-xl">
              GMBCLEANER helps businesses identify, report, and request removal of reviews that
              violate platform policies. Transparent, compliant, and built for trust.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-accent transition-all hover:scale-105"
              >
                Start Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-navy-700 hover:bg-slate-50 transition-all"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { value: 12000, suffix: '+', label: 'Cases Submitted' },
                { value: 500, suffix: '+', label: 'Businesses Helped' },
                { value: 98, suffix: '%', label: 'Compliance Rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-navy-900">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-navy-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-2xl glass shadow-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-navy-400 font-medium">gmbcleaner.com/dashboard</span>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-300">Wallet Balance</p>
              <p className="text-3xl font-bold mt-1">$245.00</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20">
              <BarChart3 className="h-6 w-6 text-teal-400" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
              <p className="text-xs text-navy-300">Active</p>
              <p className="text-lg font-bold">3</p>
            </div>
            <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
              <p className="text-xs text-navy-300">Completed</p>
              <p className="text-lg font-bold">47</p>
            </div>
            <div className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center">
              <p className="text-xs text-navy-300">Pending</p>
              <p className="text-lg font-bold">1</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { code: 'ORD-A8X2K9', status: 'Processing', color: 'text-sky-600 bg-sky-50' },
            { code: 'ORD-B7Y1J4', status: 'Completed', color: 'text-emerald-600 bg-emerald-50' },
            { code: 'ORD-C6Z0M2', status: 'Pending', color: 'text-amber-600 bg-amber-50' },
          ].map((order) => (
            <div key={order.code} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50">
                  <ShieldCheck className="h-4 w-4 text-navy-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">{order.code}</p>
                  <p className="text-xs text-navy-400">5 review URLs</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.color}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -top-6 -right-6 rounded-2xl glass shadow-card p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Lock className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-900">Secure Payment</p>
            <p className="text-xs text-navy-400">Crypto verified</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-6 -left-6 rounded-2xl glass shadow-card p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-900">4.9/5 Rating</p>
            <p className="text-xs text-navy-400">From 500+ clients</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
