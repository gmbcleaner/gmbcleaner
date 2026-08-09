import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCqcaUskeWldzBh_tX_NO10rUwxRN96334',
  authDomain: 'gmbcleaner.firebaseapp.com',
  projectId: 'gmbcleaner',
  storageBucket: 'gmbcleaner.firebasestorage.app',
  messagingSenderId: '857540659881',
  appId: '1:857540659881:web:621c856b60fb324f4cb7b8',
  measurementId: 'G-RK957N9D3Y',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch {
  app = getApps()[0] || initializeApp(firebaseConfig);
}

try {
  auth = getAuth(app);
} catch {
  auth = null as any;
}

try {
  db = getFirestore(app);
} catch {
  db = null as any;
}

let _authEnsured = false;
export async function ensureAuth(): Promise<void> {
  if (!auth || _authEnsured) return;
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    _authEnsured = true;
  } catch (e) {
    console.error('Anonymous auth failed:', e);
  }
}

export { app, auth, db };
