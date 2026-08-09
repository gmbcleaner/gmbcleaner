import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';

const footerSections = [
  {
    title: 'Services',
    links: [
      { href: '/services', label: 'Review Dispute Service' },
      { href: '/services', label: 'Reputation Management' },
      { href: '/services', label: 'Review Moderation' },
      { href: '/how-it-works', label: 'How It Works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/case-studies', label: 'Case Studies' },
      { href: '/blog', label: 'Blog & Resources' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/signup', label: 'Sign Up' },
      { href: '/login', label: 'Login' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/refund', label: 'Refund Policy' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-500">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                GMB<span className="text-teal-400">CLEANER</span>
              </span>
            </Link>
            <p className="text-sm text-navy-400 max-w-xs leading-relaxed">
              A compliant reputation management and review dispute service. We help businesses identify, report, and request removal of fake, spam, or policy-violating reviews.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 hover:bg-teal-600 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-400">
            © {new Date().getFullYear()} GMBCLEANER. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-navy-400">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> support@gmbcleaner.com
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Remote · Global
            </span>
          </div>
        </div>

        <p className="mt-6 text-xs text-navy-500 leading-relaxed max-w-4xl">
          Disclaimer: GMBCLEANER facilitates the identification and reporting of reviews that may violate platform policies. We do not guarantee removal of any review, and we do not engage with genuine, factually-based customer feedback. All disputes are submitted through official platform channels.
        </p>
      </div>
    </footer>
  );
}
