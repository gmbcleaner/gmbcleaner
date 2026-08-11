import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

let adminApp: App;
let adminDb: Firestore;

try {
  if (getApps().length === 0) {
    let serviceAccount: any = null;

    // 1. Load from serviceAccountKey.json file
    try {
      const filePath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch {}

    // 2. Load from env vars (Vercel)
    if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      adminApp = initializeApp({
        projectId: 'gmbcleaner-9dad2',
      });
    }
  } else {
    adminApp = getApps()[0];
  }
  adminDb = getFirestore(adminApp);
} catch (e) {
  console.error('Firebase Admin init error:', e);
}

export { adminApp, adminDb };
