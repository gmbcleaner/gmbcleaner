'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function Counter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => {
    const fixed = v.toFixed(decimals);
    return `${prefix}${Number(fixed).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
      const unsubscribe = rounded.on('change', (v) => setDisplay(0));
      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [inView, value, duration, motionValue, rounded]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
