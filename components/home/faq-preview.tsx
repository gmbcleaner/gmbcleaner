'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeading } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';
import { fetchCollection } from '@/lib/db';

const DEFAULT_PRICE = 1.00;
const DEFAULT_FEE = 0.15;
const DEFAULT_MIN = 20;

export function FAQPreview() {
  const [open, setOpen] = useState<number | null>(0);
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

  const faqs = [
    {
      question: 'Is GMBCLEANER a legitimate service?',
      answer: 'Yes. GMBCLEANER is a Google Maps negative review removal service that helps businesses identify and report fake, spam, and policy-violating negative reviews. We operate transparently and only submit disputes through Google\'s official channels.',
    },
    {
      question: 'Can you guarantee removal of a negative review?',
      answer: 'No. We do not guarantee removal of any review. We evaluate each case and submit policy-based disputes to Google. Genuine, factually-based customer feedback is not eligible for dispute.',
    },
    {
      question: 'How much does the service cost?',
      answer: `Each negative review dispute case costs $${price.toFixed(2)} plus a $${fee.toFixed(2)} service fee per item. You fund your wallet and pay from your account balance. The minimum deposit is $${min.toFixed(2)}.`,
    },
    {
      question: 'How long does the process take?',
      answer: 'Most cases are reviewed and submitted within 24-72 hours. Final outcomes depend on Google\'s own review process and are outside our control.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about our Google Maps negative review removal service."
        />
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-navy-900">{faq.question}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-navy-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="px-5 pb-5 text-sm text-navy-500 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3} className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View all FAQs
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
