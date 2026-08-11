'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'gmbcleaner@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const isAdmin = localStorage.getItem('gmb_admin_auth');
    if (isAdmin && user?.email === ADMIN_EMAIL) {
      router.replace('/admin');
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
    if (user.email === ADMIN_EMAIL) {
      localStorage.setItem('gmb_admin_auth', 'true');
      localStorage.setItem('gmb_admin_email', user.email);
      localStorage.removeItem('gmb_provider_auth');
      router.push('/admin');
    } else if (user.email && user.email !== ADMIN_EMAIL) {
      import('firebase/auth').then(({ getAuth, signOut }) => {
        signOut(getAuth());
      });
      setError('This Google account is not authorized for admin access.');
      setLoading(false);
    }
  }, [user, authLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy-900">GMB<span className="text-red-500">ADMIN</span></span>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>Sign in with the authorized Google account to continue.</CardDescription>
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
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
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
              Only authorized Google accounts can access the admin panel.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
