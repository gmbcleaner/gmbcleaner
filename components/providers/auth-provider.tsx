'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, rtdb } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'provider';
  user_code: string;
  wallet_balance: number;
  full_name?: string;
  company?: string;
  avatar_url?: string;
  is_blocked?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, meta?: Record<string, any>) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string; redirect?: boolean }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GMB-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function ensureProfile(user: User) {
  if (!rtdb) {
    console.error('[Auth] ensureProfile: rtdb is null, cannot write profile');
    return;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const snap = await get(ref(rtdb, `profiles/${user.uid}`));
      if (!snap.exists()) {
        const profileData = {
          email: user.email,
          role: 'user',
          user_code: generateUserCode(),
          wallet_balance: 0,
          is_blocked: false,
          full_name: user.displayName || null,
          company: null,
          avatar_url: user.photoURL || null,
          created_at: new Date().toISOString(),
        };
        await set(ref(rtdb, `profiles/${user.uid}`), profileData);
        console.log(`[Auth] ensureProfile: created profile for ${user.uid}`);
      }
      return;
    } catch (err) {
      console.error(`[Auth] ensureProfile attempt ${attempt + 1} failed:`, err);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  console.error(`[Auth] ensureProfile: all 3 attempts failed for ${user.uid}`);
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
  signUp: async () => ({}),
  signIn: async () => ({}),
  signInWithGoogle: async () => ({}),
  signOut: async () => {},
  updatePassword: async () => {},
  resetPassword: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const redirectProcessed = useRef(false);

  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      if (!rtdb) return null;
      const snap = await get(ref(rtdb, `profiles/${uid}`));
      if (snap.exists()) {
        const data = { id: uid, ...snap.val() } as UserProfile;
        setProfile(data);
        return data;
      }
    } catch {
      // Silently handle profile fetch errors
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.uid);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const handleAuth = async () => {
      try {
        // Step 1: Handle Google redirect result (critical for mobile)
        // This MUST complete before we set up the auth state listener
        if (!redirectProcessed.current) {
          try {
            const result = await getRedirectResult(auth);
            if (result?.user && mounted) {
              redirectProcessed.current = true;
              await ensureProfile(result.user);
              if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
                return;
              }
            }
          } catch (err) {
            console.error('[Auth] getRedirectResult error:', err);
            // If redirect failed but user might still be auth'd via persistence,
            // onAuthStateChanged below will handle it
          }
        }

        // Step 2: Listen for auth state changes (normal flow)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              const prof = await fetchProfile(firebaseUser.uid);
              if (prof && prof.is_blocked) {
                await firebaseSignOut(auth);
                setUser(null);
                setProfile(null);
              } else if (!prof) {
                // Profile doesn't exist in RTDB — create it now
                console.log('[Auth] onAuthStateChanged: no profile found, creating...');
                await ensureProfile(firebaseUser);
                await fetchProfile(firebaseUser.uid);
              }
            } catch (err) {
              console.error('[Auth] Profile fetch/create error:', err);
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        // Safety timeout — don't stay in loading state forever
        const timeout = setTimeout(() => {
          if (mounted) setLoading(false);
        }, 5000);

        return () => {
          mounted = false;
          unsubscribe();
          clearTimeout(timeout);
        };
      } catch {
        if (mounted) setLoading(false);
      }
    };

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, meta?: Record<string, any>): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured. Please try again later.' };
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Write profile to RTDB
      if (!rtdb) {
        console.error('[Auth] signUp: rtdb is null — profile NOT written');
        return { error: 'Database not connected. Your account was created but profile could not be saved. Please contact support.' };
      }

      try {
        await set(ref(rtdb, `profiles/${cred.user.uid}`), {
          email,
          role: 'user',
          user_code: generateUserCode(),
          wallet_balance: 0,
          is_blocked: false,
          full_name: meta?.full_name || null,
          company: meta?.company || null,
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
        console.log(`[Auth] signUp: profile created for ${cred.user.uid}`);
      } catch (dbErr) {
        console.error('[Auth] signUp: profile write FAILED:', dbErr);
        return { error: 'Account created but profile save failed. Please contact support.' };
      }

      return {};
    } catch (err: any) {
      console.error('[Auth] signUp error:', err.code);
      if (err.code === 'auth/email-already-in-use') return { error: 'An account with this email already exists.' };
      if (err.code === 'auth/weak-password') return { error: 'Password is too weak. Use at least 8 characters.' };
      if (err.code === 'auth/invalid-email') return { error: 'Invalid email address.' };
      if (err.code === 'auth/network-request-failed') return { error: 'Network error. Check your internet connection.' };
      return { error: err.message || 'Sign up failed' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured. Please try again later.' };
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (rtdb) {
        try {
          const snap = await get(ref(rtdb, `profiles/${cred.user.uid}`));
          if (snap.exists() && snap.val().is_blocked) {
            await firebaseSignOut(auth);
            return { error: 'Your account has been blocked. Please contact support.' };
          }
        } catch {
          // Block check failed — allow sign in
        }
      }
      return {};
    } catch (err: any) {
      console.error('[Auth] signIn error:', err.code);
      if (err.code === 'auth/user-not-found') return { error: 'No account found with this email.' };
      if (err.code === 'auth/wrong-password') return { error: 'Incorrect password. Please try again.' };
      if (err.code === 'auth/invalid-credential') return { error: 'Invalid email or password. Please try again.' };
      if (err.code === 'auth/too-many-requests') return { error: 'Too many attempts. Please try again later.' };
      if (err.code === 'auth/network-request-failed') return { error: 'Network error. Check your internet connection.' };
      return { error: err.message || 'Sign in failed' };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error?: string; redirect?: boolean }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured. Please try again later.' };
      const provider = new GoogleAuthProvider();

      // Try popup first on ALL devices (including mobile Chrome)
      // Popup works on modern mobile browsers and avoids redirect persistence issues
      try {
        const cred = await signInWithPopup(auth, provider);
        await ensureProfile(cred.user);
        await fetchProfile(cred.user.uid);
        return {};
      } catch (popupErr: any) {
        // If popup was blocked or closed, fall back to redirect
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          console.log('[Auth] Popup blocked/closed, falling back to redirect');
          await signInWithRedirect(auth, provider);
          return { redirect: true };
        }
        // Other popup errors — still try redirect
        if (popupErr.code !== 'auth/popup-closed-by-user') {
          console.log('[Auth] Popup failed (' + popupErr.code + '), falling back to redirect');
          await signInWithRedirect(auth, provider);
          return { redirect: true };
        }
        throw popupErr;
      }
    } catch (err: any) {
      console.error('[Auth] signInWithGoogle error:', err.code);
      if (err.code === 'auth/network-request-failed') return { error: 'Network error. Check your internet connection.' };
      return { error: err.message || 'Google sign-in failed' };
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error('Not authenticated');
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured' };
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to send reset email' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, profile, refreshProfile, signUp, signIn, signInWithGoogle, signOut, updatePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
