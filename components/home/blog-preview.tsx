'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { SectionHeading } from '@/components/shared/sections';
import { Stagger, staggerItem } from '@/components/animation/reveal';

const posts = [
  {
    slug: 'how-to-identify-fake-reviews',
    title: 'How to Identify Fake Negative Reviews on Your Google Maps Listing',
    excerpt: 'Learn the key signs of fake, spam, or policy-violating negative reviews on Google Maps and what you can do about them.',
    category: 'Google Maps',
    date: 'Aug 2026',
  },
  {
    slug: 'protect-online-reputation',
    title: 'How Businesses Can Protect Their Google Maps Reputation',
    excerpt: 'A proactive strategy for monitoring, managing, and defending your Google Maps listing from negative review attacks.',
    category: 'Reputation Management',
    date: 'Aug 2026',
  },
  {
    slug: 'listing-spam-attack-response',
    title: 'What to Do When Your Google Maps Listing Gets a Spam Attack',
    excerpt: 'A step-by-step response plan for businesses hit by coordinated negative review spam on Google Maps.',
    category: 'Review Cleanup',
    date: 'Aug 2026',
  },
];

export function BlogPreview() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Resources"
          title="Insights from our blog"
          description="Expert guidance on reputation management, review disputes, and protecting your business online."
        />
        <Stagger className="mt-16 grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.slug}
              variants={staggerItem}
              className="group rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video bg-gradient-to-br from-teal-100 via-sky-100 to-navy-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-teal-700">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-navy-400 mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </div>
                <h3 className="text-lg font-semibold text-navy-900 group-hover:text-teal-600 transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-navy-500 leading-relaxed">{post.excerpt}</p>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
