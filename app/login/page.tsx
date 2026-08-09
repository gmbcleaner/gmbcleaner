'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { FloatingShape } from '@/components/animation/floating';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  LockKeyhole,
  BadgeCheck,
  Receipt,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const trustItems = [
  { icon: LockKeyhole, label: 'Bank-grade encryption' },
  { icon: BadgeCheck, label: 'GDPR & CCPA compliant' },
  { icon: Receipt, label: 'No hidden fees' },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let title = 'Login failed';
        let description = error.message;

        if (
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('credentials')
        ) {
          title = 'Invalid credentials';
          description = 'The email or password you entered is incorrect. Please try again.';
        } else if (error.message.toLowerCase().includes('not confirmed') || error.message.toLowerCase().includes('verify')) {
          title = 'Email not confirmed';
          description = 'Please check your inbox and confirm your email before logging in.';
        }

        toast({ title, description, variant: 'destructive' });
        return;
      }

      if (data.user) {
        toast({
          title: 'Welcome back',
          description: 'You have been logged in successfully.',
        });

        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — brand / gradient */}
      <div className="relative hidden w-1/2 overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900" />
        <div className="absolute inset-0 bg-grid-dark opacity-30" />

        {/* Floating shapes */}
        <FloatingShape className="h-72 w-72 -left-20 top-24" variant="teal" duration={9} delay={0} />
        <FloatingShape className="h-80 w-80 right-0 top-1/3" variant="sky" duration={11} delay={1.5} />
        <FloatingShape className="h-64 w-64 left-1/4 bottom-10" variant="navy" duration={8} delay={0.8} />

        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3 p-10"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-400 shadow-glow">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">GMBCLEANER</span>
            <p className="text-xs font-medium text-teal-200/80">Reputation Management</p>
          </div>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 px-10 pb-16"
        >
          <h1 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight text-white">
            Welcome back to{' '}
            <span className="bg-gradient-to-r from-teal-300 to-sky-300 bg-clip-text text-transparent">
              cleaner reviews
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Log in to manage your dispute cases, track review removal progress, and keep your business reputation
            protected.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Icon className="h-4 w-4 text-teal-300" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12 lg:w-1/2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-400 shadow-glow">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-navy-900">GMBCLEANER</span>
          </div>

          <Card className="border-border/60 shadow-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Log in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard and dispute cases.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {/* Email */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-sky-500 text-white hover:from-teal-600 hover:to-sky-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    <>
                      Log in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <a
                    href="/signup"
                    className="font-semibold text-teal-600 underline-offset-4 hover:underline"
                  >
                    Sign up
                  </a>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Trust footer */}
          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5 text-teal-500" />
              Secure
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-teal-500" />
              Compliant
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-teal-500" />
              No hidden fees
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
