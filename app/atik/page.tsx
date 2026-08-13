'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Wrench, Loader2 } from 'lucide-react';

const PROVIDER_EMAIL = 'eyasinmahmudmd993@gmail.com';

export default function AtikLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const isProvider = localStorage.getItem('gmb_provider_auth');
    const providerEmail = localStorage.getItem('gmb_provider_email');
    if (isProvider && user?.email === PROVIDER_EMAIL && providerEmail === PROVIDER_EMAIL) {
      router.replace('/provider');
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    if (user.email === PROVIDER_EMAIL) {
      localStorage.setItem('gmb_provider_auth', 'true');
      localStorage.setItem('gmb_provider_email', user.email);
      localStorage.removeItem('gmb_admin_auth');
      router.push('/provider');
    } else if (user.email && user.email !== PROVIDER_EMAIL) {
      import('firebase/auth').then(({ getAuth, signOut }) => {
        signOut(getAuth());
      });
      setError('This Google account is not authorized for provider access.');
      setLoading(false);
    }
  }, [user, authLoading, router]);

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-glow">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">GMB<span className="text-blue-400">PROVIDER</span></span>
              <p className="text-xs font-medium text-blue-200/80">Service Provider Access</p>
            </div>
          </div>
          <h1 className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight text-white">
            Provider{' '}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Service provider access. Sign in with your authorized Google account to manage orders and tasks.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-glow">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-navy-900">GMB<span className="text-blue-500">PROVIDER</span></span>
          </div>

          <Card className="border-border/60 shadow-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Provider Access</CardTitle>
              <CardDescription>Sign in with your authorized Google account to continue.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading || authLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                  </svg>
                )}
                Sign in with Google
              </Button>
            </CardContent>

            <CardFooter>
              <p className="text-xs text-center text-muted-foreground w-full">
                Only <span className="font-medium">eyasinmahmudmd993@gmail.com</span> can access the provider panel.
              </p>
            </CardFooter>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-blue-500" />
              Secure
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 6.2 4.1 11.6 9 13 4.9-1.4 9-6.8 9-13V5l-9-4z"/>
              </svg>
              Provider Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
