import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";
import LoadingScreen from "../components/LoadingScreen";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exitingLoader, setExitingLoader] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Delay unmounting the initial loader slightly for visual perfection of the 1.5s animation
      if (loading) {
        setTimeout(() => {
          setExitingLoader(true);
          setTimeout(() => {
            setLoading(false);
          }, 500); // Wait for fade-out animation to complete
        }, 1200);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login with Email & Password
  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const loggedUser = result.user;

    // Check if user already exists in Firestore. If not, initialize doc.
    const userDocRef = doc(db, "users", loggedUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        displayName: loggedUser.displayName || "Google User",
        email: loggedUser.email,
        createdAt: new Date().toISOString(),
        transactions: []
      });
    }

    return result;
  };

  // Register with Email, Password and Full Name
  const registerWithEmail = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const registeredUser = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(registeredUser, { displayName: name });

    // Store display name and metadata in Firestore
    await setDoc(doc(db, "users", registeredUser.uid), {
      displayName: name,
      email: email,
      createdAt: new Date().toISOString(),
      transactions: []
    });

    return userCredential;
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen exiting={exitingLoader} /> : children}
    </AuthContext.Provider>
  );
};
