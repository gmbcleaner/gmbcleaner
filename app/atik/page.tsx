'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { FloatingShape } from '@/components/animation/floating';
import { Wrench, Lock, ArrowRight, Loader2, LockKeyhole, BadgeCheck, Shield } from 'lucide-react';

const PROVIDER_PASSWORD = '3040';

export default function AtikLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === PROVIDER_PASSWORD) {
        localStorage.setItem('gmb_provider_auth', 'true');
        localStorage.removeItem('gmb_admin_auth');
        router.push('/provider');
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <FloatingShape className="h-72 w-72 -left-20 top-24" variant="teal" duration={9} delay={0} />
        <FloatingShape className="h-80 w-80 right-0 top-1/3" variant="sky" duration={11} delay={1.5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3 p-10"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-glow">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">GMB<span className="text-blue-400">PROVIDER</span></span>
            <p className="text-xs font-medium text-blue-200/80">Service Provider Access</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 px-10 pb-16"
        >
          <h1 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight text-white">
            Provider{' '}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Service provider access. Enter your password to manage orders and tasks.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {[
              { icon: LockKeyhole, label: 'Secure access' },
              { icon: BadgeCheck, label: 'Provider only' },
              { icon: Shield, label: 'Task management' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Icon className="h-4 w-4 text-blue-300" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - password form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-glow">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-navy-900">GMB<span className="text-blue-500">PROVIDER</span></span>
          </div>

          <Card className="border-border/60 shadow-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Provider Access</CardTitle>
              <CardDescription>Enter your provider password to continue.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter provider password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Access Provider Panel
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5 text-blue-500" />
              Secure
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
              Provider Only
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
