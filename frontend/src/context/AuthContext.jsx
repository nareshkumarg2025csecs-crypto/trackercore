import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    startingBalance: null,
    displayName: null,
    loading: true
  });

  const saveUserToFirestore = async (loggedUser) => {
    try {
      const userDocRef = doc(db, "users", loggedUser.uid);
      await setDoc(userDocRef, {
        displayName: loggedUser.displayName || "",
        email: loggedUser.email,
        photoURL: loggedUser.photoURL || "",
        lastLogin: new Date().toISOString(),
        createdAt: loggedUser.metadata.creationTime || new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Silent Firestore Save Error:", error);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    // Check for redirect result on mount (Step 3)
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("Redirect login successful:", result.user.uid);
          await saveUserToFirestore(result.user);
          // Force a state update to ensure current user is recognized
          setUser(result.user);
          navigate("/");
        }
      } catch (error) {
        if (error.code !== "auth/no-auth-event") {
          console.error("AuthContext Redirect Error:", error.code, error.message);
        }
      }
    };
    handleRedirect();

    let fired = false;
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed. User:", currentUser?.uid);
      
      if (currentUser) {
        setUser(currentUser);
        // Fetch custom profile data
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              startingBalance: data.startingBalance ?? null,
              displayName: data.displayName ?? currentUser.displayName,
              loading: false
            });
          } else {
            console.log("No user document found in Firestore.");
            setUserData(prev => ({ 
              ...prev, 
              displayName: currentUser.displayName,
              loading: false 
            }));
          }
        } catch (error) {
          console.error("AuthContext Firestore Error:", error);
          setUserData(prev => ({ ...prev, loading: false }));
        }
      } else {
        setUser(null);
        setUserData({
          startingBalance: null,
          displayName: null,
          loading: false
        });
      }

      // Initial load handling
      if (!fired) {
        fired = true;
        console.log("Initial auth resolved. Triggering loader transition...");
        
        // Speed up the initial transition if we already have a user
        const delay = currentUser ? 800 : 1500;
        
        setTimeout(() => {
          setExitingLoader(true);
          setTimeout(() => {
            setLoading(false);
          }, 500); 
        }, delay);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const saveStartingBalance = async (balance) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        startingBalance: parseFloat(balance)
      }, { merge: true });
      
      setUserData(prev => ({
        ...prev,
        startingBalance: parseFloat(balance)
      }));
    } catch (error) {
      console.error("Error saving terminal balance:", error);
      throw error;
    }
  };

  const resetStartingBalance = () => {
    setUserData(prev => ({
      ...prev,
      startingBalance: null
    }));
  };

  // Login with Email & Password
  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google (Step 2 Implementation)
  const loginWithGoogle = async () => {
    try {
      // Clear persistence concerns/check user (Step 2 start)
      const currentAuthUser = auth.currentUser;
      
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Use redirect for productivity (Vercel) or mobile
      if (isMobile || !isLocalhost) {
        console.log("Environment requires redirect, initiating...");
        await signInWithRedirect(auth, googleProvider);
        return; 
      } else {
        // Desktop Local Development - use Popup with fallback
        try {
          console.log("Local desktop detected, using popup...");
          const result = await signInWithPopup(auth, googleProvider);
          if (result.user) {
            await saveUserToFirestore(result.user);
            navigate("/");
          }
          return result;
        } catch (popupError) {
          if (popupError.code === "auth/popup-blocked") {
            console.warn("Popup blocked, falling back to redirect...");
            await signInWithRedirect(auth, googleProvider);
            return;
          } else if (popupError.code === "auth/cancelled-popup-request") {
            return; // Ignore silently
          }
          throw popupError;
        }
      }
    } catch (error) {
      console.error("Complete Google Auth Failure:", {
        code: error.code,
        message: error.message,
        full: error
      });
      throw error;
    }
  };

  // Register with Email, Password and Full Name
  const registerWithEmail = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const registeredUser = userCredential.user;

    await updateProfile(registeredUser, { displayName: name });

    await setDoc(doc(db, "users", registeredUser.uid), {
      displayName: name,
      email: email,
      createdAt: new Date().toISOString()
    });

    return userCredential;
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Sign out
  const logout = () => {
    setUserData({
      startingBalance: null,
      displayName: null,
      loading: false
    });
    return signOut(auth);
  };

  const value = {
    user,
    userData,
    saveStartingBalance,
    resetStartingBalance,
    loading,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen isExiting={exitingLoader} /> : children}
    </AuthContext.Provider>
  );
};
