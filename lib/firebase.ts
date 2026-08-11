import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyC__VekaMQbA69Rk3eM0jwfm1MiK1Il6fE',
  authDomain: 'gmbcleaner-9dad2.firebaseapp.com',
  projectId: 'gmbcleaner-9dad2',
  storageBucket: 'gmbcleaner-9dad2.firebasestorage.app',
  messagingSenderId: '1021297420353',
  appId: '1:1021297420353:web:27def7105207c4bb653ec0',
  measurementId: 'G-JDZH54EFHE',
  databaseURL: 'https://gmbcleaner-9dad2-default-rtdb.firebaseio.com',
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
