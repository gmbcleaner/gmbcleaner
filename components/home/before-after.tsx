'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Star, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';

export function BeforeAfterSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Impact"
          title="See how negative review removal changes your Google Maps rating"
          description="When fake and policy-violating negative reviews are identified and disputed, your Google Maps profile reflects genuine customer experiences."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            <div className="relative rounded-2xl bg-red-50 border border-red-100 p-8">
              <div className="absolute top-4 right-4 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                Before
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-red-300 text-red-300" />
                ))}
                {[4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 text-red-200" />
                ))}
                <span className="ml-2 text-sm font-medium text-red-600">2.8 rating</span>
              </div>
              <div className="space-y-2">
                {['1-star negative reviews from non-customers', 'Competitor-coordinated attacks', 'Off-topic or abusive content', 'Misleading potential customers'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-red-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-red-100">
                <p className="text-3xl font-bold text-red-600">-23%</p>
                <p className="text-sm text-red-500">Customer trust decline</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative rounded-2xl bg-emerald-50 border border-emerald-100 p-8">
              <div className="absolute top-4 right-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                After
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-emerald-400 text-emerald-400" />
                ))}
                <Star className="h-5 w-5 fill-emerald-200 text-emerald-200" />
                <span className="ml-2 text-sm font-medium text-emerald-600">4.6 rating</span>
              </div>
              <div className="space-y-2">
                {['Fake reviews identified & disputed', 'Policy-violating content reported', 'Genuine feedback preserved', 'Accurate representation restored'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-emerald-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-emerald-100">
                <p className="text-3xl font-bold text-emerald-600">+31%</p>
                <p className="text-sm text-emerald-500">Customer trust recovery</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="mt-8 flex justify-center">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-sm text-navy-400"
          >
            <TrendingUp className="h-4 w-4 text-teal-500" />
            Results vary by case. We dispute only reviews with genuine policy grounds.
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
