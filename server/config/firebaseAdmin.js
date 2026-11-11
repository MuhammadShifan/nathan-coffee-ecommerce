import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let credential = null;

// Option 1: Path specified in env variable or default relative path
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, '../firebase-service-account.json');

// Option 2: JSON string in env variable (ideal for cloud platforms like Render / Railway / Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = cert(parsed);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
  }
} else if (existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    credential = cert(serviceAccount);
  } catch (err) {
    console.error(`Failed to read Firebase service account from ${serviceAccountPath}:`, err.message);
  }
} else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });
}

if (!getApps().length) {
  if (credential) {
    initializeApp({
      credential,
    });
    console.log('🔥 [Firebase Admin] Initialized successfully');
  } else {
    console.warn('⚠️ [Firebase Admin] Warning: No service account credentials found. Please provide server/firebase-service-account.json or set FIREBASE_SERVICE_ACCOUNT_JSON.');
  }
}

const auth = getApps().length ? getAuth() : null;

if (auth) {
  auth.auth = () => auth; // Backward compatibility with admin.auth()
}

export { auth };
export default auth;
