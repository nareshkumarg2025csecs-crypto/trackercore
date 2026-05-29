import admin from 'firebase-admin';
import fs from 'fs';

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} catch (error) {
  console.warn(`[Firebase Admin Warning] Could not read serviceAccountKey at "${keyPath}": ${error.message}`);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Fallback initialization to allow development startup without a service account key
  admin.initializeApp();
}

export default admin;
