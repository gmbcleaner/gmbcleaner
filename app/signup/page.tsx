'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/auth-provider';
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
  User,
  Building2,
  Loader2,
  CheckCircle2,
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
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
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

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, {
        full_name: fullName,
        company: company || undefined,
      });

      if (result.error) {
        let title = 'Sign up failed';
        let description = result.error;

        if (result.error.toLowerCase().includes('already') || result.error.toLowerCase().includes('registered')) {
          title = 'Email already registered';
          description = 'An account with this email already exists. Try logging in instead.';
        } else if (result.error.toLowerCase().includes('weak') || result.error.toLowerCase().includes('password')) {
          title = 'Weak password';
          description = 'Please choose a stronger password (at least 8 characters).';
        }

        toast({ title, description, variant: 'destructive' });
        return;
      }

      setSuccess(true);
      toast({
        title: 'Account created',
        description: 'Your GMBCLEANER account is ready. Redirecting you to login…',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
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
    <div className="flex min-h-screen w-full overflow-y-auto">
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
            Take control of your{' '}
            <span className="bg-gradient-to-r from-teal-300 to-sky-300 bg-clip-text text-transparent">
              online reputation
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Identify, report, and request removal of fake, spam, or policy-violating reviews — with a compliant,
            transparent process trusted by businesses worldwide.
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
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:py-8 lg:w-1/2">
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
              <CardTitle className="text-2xl font-bold tracking-tight">
                {success ? 'Account created' : 'Create your account'}
              </CardTitle>
              <CardDescription>
                {success
                  ? 'You can now log in with your credentials.'
                  : 'Start disputing fake reviews in minutes. No subscription required.'}
              </CardDescription>
            </CardHeader>

            {success ? (
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center gap-4 py-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-9 w-9 text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">Welcome to GMBCLEANER</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Redirecting you to the login page…
                    </p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </motion.div>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {/* Full name */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="full-name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="full-name"
                          type="text"
                          placeholder="Jane Doe"
                          autoComplete="name"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </motion.div>

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
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use at least 8 characters with a mix of letters and numbers.
                      </p>
                    </motion.div>

                    {/* Company (optional) */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="company">
                        Company <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Acme Inc."
                          autoComplete="organization"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
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
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={loading || googleLoading}
                     onClick={async () => {
                      setGoogleLoading(true);
                      const result = await signInWithGoogle();
                      if (result.error) {
                        toast({ title: 'Google sign-up failed', description: result.error, variant: 'destructive' });
                        setGoogleLoading(false);
                        return;
                      }
                      setSuccess(true);
                      setTimeout(() => router.push('/dashboard'), 1500);
                    }}
                  >
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    )}
                    Sign up with Google
                  </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-semibold text-teal-600 underline-offset-4 hover:underline"
                >
                  Log in
                </a>
              </p>
                </CardFooter>
              </form>
            )}
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
