'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-400">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy-900">GMBCLEANER</span>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account? <Link href="/signup" className="font-semibold text-teal-600 hover:underline">Sign up</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
