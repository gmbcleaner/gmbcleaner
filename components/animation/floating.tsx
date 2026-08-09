'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingShapeProps {
  className: string;
  variant?: 'teal' | 'sky' | 'navy';
  duration?: number;
  delay?: number;
}

const colorMap = {
  teal: 'bg-teal-400/20',
  sky: 'bg-sky-400/20',
  navy: 'bg-slate-700/20',
};

export function FloatingShape({
  className,
  variant = 'teal',
  duration = 8,
  delay = 0,
}: FloatingShapeProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${colorMap[variant]} ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function GradientGlow({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/30 via-sky-400/20 to-transparent blur-3xl animate-pulse-glow" />
    </div>
  );
}

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  floatDelay?: number;
}

export function FloatingCard({ children, className = '', floatDelay = 0 }: FloatingCardProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
