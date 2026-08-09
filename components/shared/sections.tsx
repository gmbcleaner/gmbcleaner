'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Reveal } from '@/components/animation/reveal';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-teal-400/10 to-sky-400/10 rounded-full blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-sm font-medium text-teal-700">
              {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={0.1}>
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 text-balance">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg text-navy-500 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.3}>
            <div className="mt-8">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-navy-900 text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-navy-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function CTABanner({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-8 py-16 md:px-16 md:py-20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">{title}</h2>
            <p className="mt-4 text-lg text-navy-300 max-w-2xl mx-auto">{description}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-accent transition-all hover:scale-105"
              >
                {primaryLabel}
              </a>
              {secondaryHref && (
                <a
                  href={secondaryHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  {secondaryLabel}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
