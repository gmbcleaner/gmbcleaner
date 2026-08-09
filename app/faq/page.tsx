'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, CTABanner } from '@/components/shared/sections';
import { Reveal } from '@/components/animation/reveal';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { fetchCollection } from '@/lib/db';
import { HelpCircle, MessageCircle } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

const categoryConfig: Record<string, { label: string; icon: typeof HelpCircle; color: string }> = {
  general: { label: 'General', icon: HelpCircle, color: 'from-teal-500 to-teal-600' },
  pricing: { label: 'Pricing', icon: HelpCircle, color: 'from-sky-500 to-sky-600' },
  security: { label: 'Security', icon: HelpCircle, color: 'from-teal-500 to-sky-500' },
  payments: { label: 'Payments', icon: HelpCircle, color: 'from-sky-500 to-teal-500' },
};

const fallbackFaqs: Faq[] = [
  {
    id: 'f1',
    question: 'Is GMBCLEANER a legitimate service?',
    answer:
      'Yes. GMBCLEANER is a reputation management platform that helps businesses identify and report reviews that may violate platform policies. We operate transparently and only submit disputes through official channels.',
    category: 'general',
    sort_order: 1,
    is_published: true,
  },
  {
    id: 'f2',
    question: 'Can you guarantee removal of a review?',
    answer:
      'No. We do not guarantee removal of any review. We evaluate each case and submit policy-based disputes. Genuine, factually-based customer feedback is not eligible for dispute.',
    category: 'general',
    sort_order: 2,
    is_published: true,
  },
  {
    id: 'f3',
    question: 'How long does the process take?',
    answer:
      'Most cases are reviewed and submitted within 24-72 hours. Final outcomes depend on the platform\'s own review process and are outside our control.',
    category: 'general',
    sort_order: 4,
    is_published: true,
  },
  {
    id: 'f4',
    question: 'How much does the service cost?',
    answer:
      'Each review case costs $1.00 plus a $0.15 service fee per item. You fund your wallet and pay from your account balance. The minimum deposit is $20.',
    category: 'pricing',
    sort_order: 3,
    is_published: true,
  },
  {
    id: 'f5',
    question: 'Is my data secure?',
    answer:
      'Yes. We use secure authentication, encrypted connections, and strict access controls. Your account data and order history are private to you.',
    category: 'security',
    sort_order: 6,
    is_published: true,
  },
  {
    id: 'f6',
    question: 'What payment methods do you accept?',
    answer:
      'We accept cryptocurrency payments including USDT on TRC20, BEP20, and ERC20 networks, as well as other configurable options. Wallet addresses are provided in your dashboard.',
    category: 'payments',
    sort_order: 5,
    is_published: true,
  },
];

const categoryOrder = ['general', 'pricing', 'security', 'payments'];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await fetchCollection(
          'faqs',
          [{ field: 'is_published', op: '==', value: true }],
          'sort_order'
        );
        if (data && data.length > 0) {
          setFaqs(data as Faq[]);
        } else {
          setFaqs(fallbackFaqs);
        }
      } catch {
        setFaqs(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const allFaqs: Faq[] = faqs.length > 0 ? faqs : fallbackFaqs;

  const grouped: Record<string, Faq[]> = {};
  for (const faq of allFaqs) {
    if (!grouped[faq.category]) grouped[faq.category] = [];
    grouped[faq.category].push(faq);
  }

  const orderedCategories = categoryOrder.filter((c) => grouped[c] && grouped[c].length > 0);
  const otherCategories = Object.keys(grouped).filter(
    (c) => !categoryOrder.includes(c) && grouped[c].length > 0
  );
  const allCategories = [...orderedCategories, ...otherCategories];

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="FAQ"
          title={
            <>
              Frequently asked <span className="gradient-text">questions</span>
            </>
          }
          description="Everything you need to know about our review dispute service, pricing, security, and payment methods. Can't find what you're looking for? Reach out to our team."
        />

        {/* FAQ Categories */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {allCategories.map((category, ci) => {
                const config = categoryConfig[category] || {
                  label: category.charAt(0).toUpperCase() + category.slice(1),
                  icon: HelpCircle,
                  color: 'from-teal-500 to-sky-500',
                };
                const Icon = config.icon;
                return (
                  <Reveal key={category} delay={ci * 0.05}>
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} shadow-soft`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-navy-900">{config.label}</h2>
                        <span className="ml-auto text-sm text-navy-400 font-medium">
                          {grouped[category].length}{' '}
                          {grouped[category].length === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                      <Card className="border border-slate-200 shadow-card overflow-hidden">
                        <CardContent className="p-6 md:p-8">
                          <Accordion type="single" collapsible className="w-full">
                            {grouped[category].map((faq, fi) => (
                              <AccordionItem
                                key={faq.id}
                                value={`${category}-${fi}`}
                                className={fi === grouped[category].length - 1 ? 'border-b-0' : ''}
                              >
                                <AccordionTrigger className="text-left text-base font-medium text-navy-900 hover:no-underline">
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-navy-500 leading-relaxed">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Card className="border-2 border-teal-200 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-sky-50 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 flex-shrink-0">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-navy-900">
                        Still have questions?
                      </h2>
                      <p className="mt-2 text-navy-600 leading-relaxed">
                        Our team is here to help. Whether you want to understand our process better,
                        discuss your specific situation, or get started with your first case — we
                        are happy to talk.
                      </p>
                    </div>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-accent transition-all hover:scale-105 whitespace-nowrap"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        <CTABanner
          title="Ready to take control of your online reputation?"
          description="Create your account today, fund your wallet, and start submitting dispute cases through official channels. Transparent pricing, no commitments."
          primaryHref="/signup"
          primaryLabel="Get Started"
          secondaryHref="/pricing"
          secondaryLabel="View Pricing"
        />
      </main>
      <Footer />
    </>
  );
}
