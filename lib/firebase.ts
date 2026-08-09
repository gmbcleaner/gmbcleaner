import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCqcaUskeWldzBh_tX_NO10rUwxRN96334',
  authDomain: 'gmbcleaner.firebaseapp.com',
  projectId: 'gmbcleaner',
  storageBucket: 'gmbcleaner.firebasestorage.app',
  messagingSenderId: '857540659881',
  appId: '1:857540659881:web:621c856b60fb324f4cb7b8',
  measurementId: 'G-RK957N9D3Y',
  databaseURL: 'https://gmbcleaner-default-rtdb.firebaseio.com',
};

let app: FirebaseApp;
let auth: Auth;
let rtdb: Database;

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
  rtdb = getDatabase(app);
} catch {
  rtdb = null as any;
}

export { app, auth, rtdb };
