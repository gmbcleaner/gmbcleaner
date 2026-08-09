'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, CTABanner } from '@/components/shared/sections';
import { Stagger, staggerItem } from '@/components/animation/reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  author: string;
}

interface FallbackPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  author: string;
}

const fallbackPosts: FallbackPost[] = [
  {
    id: 'fb1',
    title: 'How to Identify Fake Reviews on Your Google Business Listing',
    slug: 'how-to-identify-fake-reviews',
    excerpt:
      'Learn the key signs of fake, spam, or policy-violating reviews and what you can do about them.',
    category: 'Reputation Management',
    published_at: '2025-01-15T10:00:00Z',
    author: 'GMBCLEANER Team',
  },
  {
    id: 'fb2',
    title: 'How Businesses Can Protect Their Online Reputation',
    slug: 'protect-online-reputation',
    excerpt:
      'A proactive strategy for monitoring, managing, and defending your brand reputation across review platforms.',
    category: 'Online Reputation',
    published_at: '2025-01-20T10:00:00Z',
    author: 'GMBCLEANER Team',
  },
  {
    id: 'fb3',
    title: 'What to Do When Your Listing Gets a Spam Attack',
    slug: 'listing-spam-attack-response',
    excerpt: 'A step-by-step response plan for businesses hit by coordinated review spam.',
    category: 'Review Cleanup',
    published_at: '2025-01-25T10:00:00Z',
    author: 'GMBCLEANER Team',
  },
  {
    id: 'fb4',
    title: 'How Review Moderation Works: A Transparent Look',
    slug: 'how-review-moderation-works',
    excerpt:
      'Understanding the policies and processes behind review moderation on major platforms.',
    category: 'Review Moderation',
    published_at: '2025-02-01T10:00:00Z',
    author: 'GMBCLEANER Team',
  },
  {
    id: 'fb5',
    title: 'Responding to Negative Reviews Professionally',
    slug: 'responding-to-negative-reviews',
    excerpt:
      'Best practices for responding to genuine negative feedback in a way that builds trust.',
    category: 'Customer Feedback',
    published_at: '2025-02-05T10:00:00Z',
    author: 'GMBCLEANER Team',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Reputation Management': 'bg-teal-50 text-teal-700 border-teal-200',
    'Online Reputation': 'bg-sky-50 text-sky-700 border-sky-200',
    'Review Cleanup': 'bg-teal-50 text-teal-700 border-teal-200',
    'Review Moderation': 'bg-sky-50 text-sky-700 border-sky-200',
    'Customer Feedback': 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return colors[category] || 'bg-slate-100 text-navy-700 border-slate-200';
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, published_at, author')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const allPosts = posts && posts.length > 0 ? (posts as BlogPost[]) : fallbackPosts;

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Resources"
          title={
            <>
              Insights for protecting your <span className="gradient-text">online reputation</span>
            </>
          }
          description="Guides, best practices, and expert insights on identifying fake reviews, understanding platform policies, and managing your business reputation the right way."
        />

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allPosts.map((post, i) => (
                <motion.div key={post.id} variants={staggerItem}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <Card className="h-full border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all duration-300 overflow-hidden">
                      {/* Gradient header */}
                      <div className="relative h-40 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold gradient-text opacity-80">
                            {post.category.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getCategoryColor(
                              post.category
                            )}`}
                          >
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6 flex flex-col h-[calc(100%-10rem)]">
                        <h3 className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-sm text-navy-500 leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-navy-400">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(post.published_at)}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                          Read more
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        <CTABanner
          title="Ready to put these insights into action?"
          description="Create your account, fund your wallet, and start submitting dispute cases for fake or policy-violating reviews today."
          primaryHref="/signup"
          primaryLabel="Get Started"
          secondaryHref="/contact"
          secondaryLabel="Talk to Us"
        />
      </main>
      <Footer />
    </>
  );
}
