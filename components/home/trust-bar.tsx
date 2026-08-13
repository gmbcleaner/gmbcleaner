'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Eye, FileCheck } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'Compliant Process', desc: 'Official channels only' },
  { icon: Eye, label: 'Transparent Tracking', desc: 'Real-time status updates' },
  { icon: FileCheck, label: 'Policy-Based Disputes', desc: 'No false promises' },
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-100 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
                  <Icon className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{badge.label}</p>
                  <p className="text-xs text-navy-400">{badge.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
