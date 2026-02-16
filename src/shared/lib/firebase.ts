import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Validate required environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Check for missing required environment variables
const missingVars: string[] = [];
if (!apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId)
  missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  const errorMessage = `Missing required Firebase environment variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}`;

  if (process.env.NODE_ENV === 'development') {
    console.error('\x1b[31m%s\x1b[0m', '❌ Firebase Configuration Error:');
    console.error(errorMessage);
  }

  throw new Error(errorMessage);
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
export default app;
