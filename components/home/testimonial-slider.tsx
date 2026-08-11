'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';

const testimonials = [
  {
    author_name: 'Sarah Mitchell',
    author_role: 'Operations Director',
    company: 'Brightside Dental',
    content: 'GMBCLEANER helped us address a wave of spam reviews that were hurting our local search ranking. Their team was professional and transparent throughout.',
    rating: 5,
  },
  {
    author_name: 'James Okoro',
    author_role: 'Franchise Owner',
    company: 'Urban Fitness Group',
    content: 'After a competitor attack, we had dozens of fake reviews. GMBCLEANER systematically identified and reported each one. The process was clear and compliant.',
    rating: 5,
  },
  {
    author_name: 'Lena Park',
    author_role: 'Marketing Manager',
    company: 'Parkside Hospitality',
    content: 'What I appreciate most is the honesty. They told us upfront which reviews were genuine and should stay, and which ones had policy grounds for dispute.',
    rating: 5,
  },
  {
    author_name: 'David Chen',
    author_role: 'CEO',
    company: 'Chen Automotive',
    content: 'The dashboard makes it easy to submit cases and track status. Funding the wallet was straightforward and support was responsive.',
    rating: 5,
  },
];

export function TestimonialSlider() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => setIndex((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [auto]);

  const next = () => { setAuto(false); setIndex((p) => (p + 1) % testimonials.length); };
  const prev = () => { setAuto(false); setIndex((p) => (p - 1 + testimonials.length) % testimonials.length); };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What our clients say"
          description="Real businesses, real results. Here's what clients share about working with GMBCLEANER."
        />
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
            <Quote className="absolute top-8 left-8 h-12 w-12 text-teal-500/20" />
            <div className="relative min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonials[index].rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl text-white leading-relaxed">
                    &ldquo;{testimonials[index].content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-white font-bold">
                      {testimonials[index].author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonials[index].author_name}</p>
                      <p className="text-sm text-navy-300">
                        {testimonials[index].author_role}, {testimonials[index].company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative mt-8 flex items-center justify-between">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setAuto(false); setIndex(i); }}
                    className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-teal-400' : 'w-2 bg-white/20'}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
