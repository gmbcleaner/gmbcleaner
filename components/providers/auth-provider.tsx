'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  type User,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, rtdb } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, meta?: Record<string, any>) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'provider';
  user_code: string;
  wallet_balance: number;
  full_name?: string;
  company?: string;
  avatar_url?: string;
}

function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GMB-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function ensureProfile(user: User) {
  try {
    if (!rtdb) return;
    const snap = await get(ref(rtdb, `profiles/${user.uid}`));
    if (!snap.exists()) {
      await set(ref(rtdb, `profiles/${user.uid}`), {
        email: user.email,
        role: 'user',
        user_code: generateUserCode(),
        wallet_balance: 0,
        full_name: user.displayName || null,
        company: null,
        avatar_url: user.photoURL || null,
        created_at: new Date().toISOString(),
      });
    }
  } catch {}
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
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (uid: string) => {
    try {
      if (!rtdb) return;
      const snap = await get(ref(rtdb, `profiles/${uid}`));
      if (snap.exists()) {
        setProfile({ id: uid, ...snap.val() } as UserProfile);
      }
    } catch {}
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchProfile(firebaseUser.uid);
          if (rtdb) {
            const snap = await get(ref(rtdb, `profiles/${firebaseUser.uid}`));
            if (snap.exists() && snap.val().is_blocked) {
              await firebaseSignOut(auth);
              setUser(null);
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      const timeout = setTimeout(() => setLoading(false), 5000);
      return () => { unsubscribe(); clearTimeout(timeout); };
    } catch {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, meta?: Record<string, any>): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured' };
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (rtdb) {
        await set(ref(rtdb, `profiles/${cred.user.uid}`), {
          email,
          role: 'user',
          user_code: generateUserCode(),
          wallet_balance: 0,
          full_name: meta?.full_name || null,
          company: meta?.company || null,
          created_at: new Date().toISOString(),
        });
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured' };
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (rtdb) {
        const snap = await get(ref(rtdb, `profiles/${cred.user.uid}`));
        if (snap.exists() && snap.val().is_blocked) {
          await firebaseSignOut(auth);
          return { error: 'Your account has been blocked. Please contact support.' };
        }
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign in failed' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      if (!auth) return { error: 'Firebase Auth not configured' };
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await ensureProfile(cred.user);

      if (rtdb) {
        const snap = await get(ref(rtdb, `profiles/${cred.user.uid}`));
        if (snap.exists() && snap.val().is_blocked) {
          await firebaseSignOut(auth);
          return { error: 'Your account has been blocked. Please contact support.' };
        }
      }

      await fetchProfile(cred.user.uid);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Google sign-in failed' };
    }
  };

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
    setProfile(null);
  };

  const updatePassword = async (newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error('Not authenticated');
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, refreshProfile, signUp, signIn, signInWithGoogle, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
