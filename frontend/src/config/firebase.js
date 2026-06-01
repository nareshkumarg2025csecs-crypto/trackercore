import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TrackerCore client-side Firebase Web configuration.
// Utilizes environment variables (Vite import.meta.env) with valid-looking local development fallbacks.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyPlaceholderForTrackerCore",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "TrackerCore-tracker.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "TrackerCore-tracker",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "TrackerCore-tracker.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
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

export { app, auth, db, googleProvider };
