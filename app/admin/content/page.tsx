'use client';

import { useEffect, useState } from 'react';
import { fetchCollection, addDocument, updateDocument, deleteDocument } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface FAQ { id: string; question: string; answer: string; category: string; is_published: boolean; }
interface Testimonial { id: string; name: string; company: string; content: string; rating: number; is_published: boolean; }
interface BlogPost { id: string; title: string; slug: string; excerpt: string; content: string; category: string; author: string; is_published: boolean; }

export default function AdminContentPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqDialog, setFaqDialog] = useState(false);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, t, b] = await Promise.all([
          fetchCollection('faqs'),
          fetchCollection('testimonials', undefined, 'created_at'),
          fetchCollection('blog_posts', undefined, 'created_at'),
        ]);
        setFaqs((f as FAQ[]) || []);
        setTestimonials((t as Testimonial[]) || []);
        setPosts((b as BlogPost[]) || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const addFaq = async () => {
    setSaving(true);
    try {
      await addDocument('faqs', { question: faqQ, answer: faqA, category: faqCat, is_published: true, sort_order: faqs.length });
      toast({ title: 'FAQ added' });
      setFaqDialog(false); setFaqQ(''); setFaqA('');
      const data = await fetchCollection('faqs');
      setFaqs((data as FAQ[]) || []);
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const deleteFaq = async (id: string) => {
    await deleteDocument('faqs', id);
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const toggleFaq = async (faq: FAQ) => {
    await updateDocument('faqs', faq.id, { is_published: !faq.is_published });
    setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_published: !f.is_published } : f));
  };

  const toggleTestimonial = async (t: Testimonial) => {
    await updateDocument('testimonials', t.id, { is_published: !t.is_published });
    setTestimonials(testimonials.map(x => x.id === t.id ? { ...x, is_published: !x.is_published } : x));
  };

  const togglePost = async (p: BlogPost) => {
    await updateDocument('blog_posts', p.id, { is_published: !p.is_published });
    setPosts(posts.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Management</h1>
        <p className="text-sm text-slate-500">Manage FAQs, testimonials, blog posts, and site content.</p>
      </div>

      <Tabs defaultValue="faqs">
        <TabsList>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials ({testimonials.length})</TabsTrigger>
          <TabsTrigger value="blog">Blog ({posts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFaqDialog(true)} className="bg-gradient-to-r from-teal-500 to-sky-500 text-white"><Plus className="mr-2 h-4 w-4" />Add FAQ</Button>
          </div>
          {faqs.map((faq) => (
            <Card key={faq.id} className="shadow-card">
              <CardContent className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{faq.category}</Badge>
                    <Badge className={faq.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>{faq.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => toggleFaq(faq)}>{faq.is_published ? 'Unpublish' : 'Publish'}</Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteFaq(faq.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          {testimonials.map((t) => (
            <Card key={t.id} className="shadow-card">
              <CardContent className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{t.name} {t.company && <span className="font-normal text-slate-500">at {t.company}</span>}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.content}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{t.rating}/5 stars</Badge>
                    <Badge className={t.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>{t.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="ml-4" onClick={() => toggleTestimonial(t)}>{t.is_published ? 'Unpublish' : 'Publish'}</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          {posts.map((p) => (
            <Card key={p.id} className="shadow-card">
              <CardContent className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.excerpt}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                    <Badge className={p.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>{p.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="ml-4" onClick={() => togglePost(p)}>{p.is_published ? 'Unpublish' : 'Publish'}</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={faqDialog} onOpenChange={setFaqDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add FAQ</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Question</Label><Input value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="Enter question" /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={faqCat} onChange={(e) => setFaqCat(e.target.value)} placeholder="e.g., general, pricing" /></div>
            <div className="space-y-2"><Label>Answer</Label><Textarea rows={4} value={faqA} onChange={(e) => setFaqA(e.target.value)} placeholder="Enter answer" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqDialog(false)}>Cancel</Button>
            <Button onClick={addFaq} disabled={!faqQ || !faqA}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
