'use client';

import { useState } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader, CTABanner } from '@/components/shared/sections';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { addDocument } = await import('@/lib/db');
      await addDocument('contact_messages', { name, email, subject, message });
      toast({ title: 'Message sent!', description: 'We will get back to you within 24 hours.' });
      setSent(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Contact"
          title={
            <>
              Get in <span className="gradient-text">touch</span>
            </>
          }
          description="Have a question about our service? Want to discuss your specific situation? We respond to all inquiries within 24 hours."
        />

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Email Us</h3>
                      <p className="text-xs text-slate-500">We respond within 24 hours</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">support@gmbcleaner.com</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                      <MessageSquare className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Live Support</h3>
                      <p className="text-xs text-slate-500">Available 24/7</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Chat with us directly from your dashboard.</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <Card className="shadow-card">
                  <CardContent className="p-6 md:p-8">
                    {sent ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-4">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          Thank you for reaching out. We will get back to you within 24 hours.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-6"
                          onClick={() => setSent(false)}
                        >
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@company.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            placeholder="How can we help?"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us about your situation..."
                            rows={5}
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600"
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <CTABanner
          title="Ready to get started?"
          description="Create your account and start protecting your business reputation today."
          primaryHref="/signup"
          primaryLabel="Get Started"
          secondaryHref="/how-it-works"
          secondaryLabel="Learn More"
        />
      </main>
      <Footer />
    </>
  );
}
