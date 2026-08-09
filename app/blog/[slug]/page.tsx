'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Reveal, Stagger, staggerItem } from '@/components/animation/reveal';
import { FloatingShape } from '@/components/animation/floating';
import { Card, CardContent } from '@/components/ui/card';
import { fetchCollection } from '@/lib/db';
import { ArrowLeft, ArrowRight, Calendar, User, Tag, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featured_image: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  author: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadTime(content: string): string {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const data = await fetchCollection(
          'blog_posts',
          [
            { field: 'slug', op: '==', value: slug },
            { field: 'is_published', op: '==', value: true },
          ]
        );

        if (!data || data.length === 0) {
          notFound();
          return;
        }

        setPost(data[0] as BlogPost);

        const relatedData = await fetchCollection(
          'blog_posts',
          [{ field: 'is_published', op: '==', value: true }],
          'published_at',
          3
        );

        if (relatedData) {
          setRelatedPosts(
            (relatedData as RelatedPost[]).filter((r) => r.slug !== slug)
          );
        }
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="py-32"><div /></main>
        <Footer />
      </>
    );
  }

  if (!post) {
    notFound();
  }

  const postData = post!;

  const contentParagraphs = postData.content
    ? postData.content.split(/\n\n+/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <>
      <Navbar />
      <main>
        {/* Article Header */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-teal-400/10 to-sky-400/10 rounded-full blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
                {postData.category}
              </span>
            </Reveal>
            <Reveal delay={0.15}>
              <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-navy-900 text-balance">
                {postData.title}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg text-navy-500 leading-relaxed">
                {postData.excerpt}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-navy-400">
                <span className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-white text-xs font-bold">
                    {postData.author.charAt(0)}
                  </div>
                  <span className="font-medium text-navy-700">{postData.author}</span>
                </span>
                {postData.published_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(postData.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {estimateReadTime(postData.content)}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Featured Image / Gradient Banner */}
        <section className="pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative h-64 md:h-80 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl md:text-7xl font-bold gradient-text opacity-60">
                    {postData.category.charAt(0)}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-medium text-white">
                    <Tag className="h-3 w-3" />
                    {postData.category}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Article Content */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <article className="prose prose-lg max-w-none">
                {contentParagraphs.length > 0 ? (
                  <div className="space-y-6">
                    {contentParagraphs.map((paragraph, i) => (
                      <p key={i} className="text-navy-700 leading-relaxed text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-navy-700 leading-relaxed text-lg">
                    {postData.excerpt || postData.content}
                  </p>
                )}

                {/* Tags */}
                {postData.tags && postData.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-navy-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </Reveal>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal>
                <div className="text-center max-w-3xl mx-auto">
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Keep Reading
                  </span>
                  <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-navy-900 text-balance">
                    Related articles
                  </h2>
                  <p className="mt-4 text-lg text-navy-500 leading-relaxed">
                    More resources to help you protect your online reputation.
                  </p>
                </div>
              </Reveal>
              <Stagger className="mt-12 grid md:grid-cols-3 gap-8">
                {relatedPosts.map((related, i) => (
                  <div key={related.id}>
                    <Link href={`/blog/${related.slug}`} className="group block h-full">
                      <Card className="h-full border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all duration-300 overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/20 rounded-full blur-3xl" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold gradient-text opacity-80">
                              {related.category.charAt(0)}
                            </span>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                              {related.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="mt-3 text-sm text-navy-500 leading-relaxed line-clamp-2">
                            {related.excerpt}
                          </p>
                          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                            Read more
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </Stagger>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-8 py-12 md:px-16 md:py-14">
                <FloatingShape className="top-0 right-0 w-64 h-64" variant="teal" />
                <FloatingShape className="bottom-0 left-0 w-64 h-64" variant="sky" />
                <div className="relative text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white text-balance">
                    Ready to protect your reputation?
                  </h2>
                  <p className="mt-4 text-lg text-navy-300 max-w-2xl mx-auto">
                    Create your account today and start submitting dispute cases through official
                    channels. Transparent pricing, no commitments.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-accent transition-all hover:scale-105"
                    >
                      Get Started
                    </a>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                    >
                      Talk to Us
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
