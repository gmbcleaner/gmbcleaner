'use client';

export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <svg viewBox="0 0 320 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="50%" stopColor="#00bcd4"/>
          <stop offset="100%" stopColor="#0288d1"/>
        </linearGradient>
        <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="100%" stopColor="#0097a7"/>
        </linearGradient>
        <linearGradient id="sg3" x1="30" y1="6" x2="52" y2="54">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="100%" stopColor="#00838f"/>
        </linearGradient>
      </defs>

      {/* Shield outer */}
      <path d="M30 5L9 15.5V28C9 39.5 16.5 50 30 53C43.5 50 51 39.5 51 28V15.5L30 5Z"
        stroke="url(#sg1)" strokeWidth="2.8" fill="none" strokeLinejoin="round"/>

      {/* Shield inner 3D effect */}
      <path d="M30 9L13 17.5V28C13 37.5 19 46 30 48.5C41 46 47 37.5 47 28V17.5L30 9Z"
        stroke="url(#sg2)" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinejoin="round"/>

      {/* Checkmark */}
      <path d="M20 31L27 38L40 24" stroke="url(#sg3)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* GMB text */}
      <text x="64" y="35" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="30" fontWeight="900" fill="white" letterSpacing="1">GMB</text>

      {/* CLEANER text */}
      <text x="152" y="35" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="30" fontWeight="900" fill="url(#sg1)" letterSpacing="1">CLEANER</text>

      {/* Tagline */}
      <text x="64" y="52" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="8.5" fontWeight="600" fill="#546e7a" letterSpacing="2.5">SMART &amp; TRUSTED REPUTATION SOLUTIONS</text>
    </svg>
  );
}

export function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sgi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="50%" stopColor="#00bcd4"/>
          <stop offset="100%" stopColor="#0288d1"/>
        </linearGradient>
        <linearGradient id="sgi2" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="100%" stopColor="#00838f"/>
        </linearGradient>
      </defs>
      <path d="M24 3L6 12V22C6 31 12 40 24 43C36 40 42 31 42 22V12L24 3Z"
        stroke="url(#sgi)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M24 7L10 14V22C10 29 14.5 36 24 38.5C33.5 36 38 29 38 22V14L24 7Z"
        stroke="url(#sgi)" strokeWidth="1" fill="none" opacity="0.35" strokeLinejoin="round"/>
      <path d="M16 24L22 30L33 18" stroke="url(#sgi2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
