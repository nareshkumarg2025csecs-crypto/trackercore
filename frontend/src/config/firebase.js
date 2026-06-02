import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// TrackerCore client-side Firebase Web configuration.
// Utilizes environment variables (Vite import.meta.env) with valid-looking local development fallbacks.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2CD-ywVDmTbRjEIpWVPCV8SOlT4dtjb4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trackercore-f1f63.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trackercore-f1f63",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trackercore-f1f63.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "53877656804",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:53877656804:web:a0ad4de6e5c33b98eab0f1"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Set persistence (survives page refreshes and popup closures)
try {
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.error("Firebase persistence error:", error);
}

// Initialize Firestore
const db = getFirestore(app);

// Google Auth Provider configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: ''
});

const isEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

if (isEmulator && import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Firebase Emulator connected — using local auth and Firestore');
}

export { app, auth, db, googleProvider };
