import {
  type AppOptions,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin initialization (server-only)
// Supports either a base64-encoded service account JSON or individual env vars
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

let adminAppOptions: AppOptions | undefined;

if (serviceAccountBase64) {
  try {
    const decoded = Buffer.from(serviceAccountBase64, 'base64').toString(
      'utf8'
    );
    const svc = JSON.parse(decoded);
    adminAppOptions = { credential: cert(svc) };
  } catch {
    // fallback to individual envs below
  }
}

if (!adminAppOptions && projectId && clientEmail && privateKeyRaw) {
  adminAppOptions = {
    credential: cert({ projectId, clientEmail, privateKey: privateKeyRaw }),
  };
}

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp(adminAppOptions);

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
