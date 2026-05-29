import admin from 'firebase-admin';

let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.error(`[Firebase Admin Error] Could not parse FIREBASE_SERVICE_ACCOUNT environment variable: ${error.message}`);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Fallback initialization to allow development startup if environment variable is missing
  admin.initializeApp();
}

export default admin;

export default admin;
