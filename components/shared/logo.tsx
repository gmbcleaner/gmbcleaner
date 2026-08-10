'use client';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="check-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path d="M28 4L8 14v12c0 11 8.5 21.5 20 24 11.5-2.5 20-13 20-24V14L28 4z" stroke="url(#shield-grad)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      {/* Checkmark */}
      <path d="M19 30l6 6 11-12" stroke="url(#check-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* GMB text */}
      <text x="62" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="800" fill="white" letterSpacing="-0.5">GMB</text>
      {/* CLEANER text */}
      <text x="138" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="800" fill="url(#shield-grad)" letterSpacing="-0.5">CLEANER</text>
      {/* Tagline */}
      <text x="62" y="48" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8" fontWeight="500" fill="#64748b" letterSpacing="1.5">SMART &amp; TRUSTED REPUTATION SOLUTIONS</text>
    </svg>
  );
}

export function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="shield-grad-icon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="check-grad-icon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M24 4L6 12v10c0 10 7.5 19.5 18 22 10.5-2.5 18-12 18-22V12L24 4z" stroke="url(#shield-grad-icon)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M16 25l5 5 9-10" stroke="url(#check-grad-icon)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
