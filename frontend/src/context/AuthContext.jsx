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

/**
 * Deep Cleanup Utility
 * Clears all possible forms of stored authentication data to resolve "stuck" sessions
 * or corrupted token states.
 */
const performDeepCleanup = async (firebaseAuth) => {
  console.warn("⚠️ Initiating deep security cleanup...");
  
  // 1. Clear Local & Session Storage (Vite/Firebase keys)
  localStorage.clear();
  sessionStorage.clear();
  
  // 2. Clear all cookies (including Firebase auth cookies)
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }

  // 3. Attempt Firebase Sign Out
  try {
    if (firebaseAuth) await signOut(firebaseAuth);
  } catch (e) {
    console.error("Cleanup SignOut Error:", e);
  }
};

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
      console.error("Firestore Save Error:", {
        code: error.code,
        message: error.message,
        projectId: auth.app.options.projectId
      });
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
          setUser(result.user);
          navigate("/");
        }
      } catch (error) {
        console.error("🔒 Auth Security Event:", {
          code: error.code,
          message: error.message,
          email: error.customData?.email
        });

        // CRITICAL: Handle specific corruption/blocking codes
        const fatalCodes = [
          "auth/user-disabled",
          "auth/user-token-expired",
          "auth/invalid-user-token",
          "auth/tenant-id-mismatch"
        ];

        if (fatalCodes.includes(error.code)) {
          console.error("🚨 Account Status Critical. Running Deep Cleanup.");
          await performDeepCleanup(auth);
          window.location.reload(); // Force refresh to clear internal memory
        }
      }
    };
    handleRedirect();

    let fired = false;
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed. User:", currentUser?.uid);
      
      if (currentUser) {
        // Handle token refreshing
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh
          console.log("Token Verified. Issued At:", idTokenResult.issuedAtTime);
        } catch (tokenError) {
          console.error("Token Integrity Failure:", tokenError);
          await performDeepCleanup(auth);
          return;
        }

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

  /**
   * Enhanced Error Parser
   * Maps Firebase codes to actionable messages and system behaviors
   */
  const handleAuthError = (error) => {
    console.error("Diagnostic Auth Error:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    switch (error.code) {
      case "auth/too-many-requests":
        return "Access temporarily blocked due to unusual activity. Try again in 5 minutes.";
      case "auth/user-disabled":
        performDeepCleanup(auth);
        return "This account has been disabled by security protocols.";
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/network-request-failed":
        return "Signal lost. Check your uplink/network connection.";
      case "auth/internal-error":
        return "Core systems failure. Attempting automatic recovery...";
      default:
        return error.message || "An unauthorized access event occurred.";
    }
  };

  // Login with Email & Password
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Login Success", userCredential.user);
      return userCredential;
    } catch (error) {
      console.log("Full Error:", error);
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);
      
      // Re-throw with enhanced message for UI display
      throw { ...error, message: handleAuthError(error) };
    }
  };

  // Login with Google (Step 2 Implementation)
  const loginWithGoogle = async () => {
    try {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile || !isLocalhost) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          if (result.user) {
            await saveUserToFirestore(result.user);
            navigate("/");
          }
          return result;
        } catch (popupError) {
          if (popupError.code === "auth/popup-blocked") {
            await signInWithRedirect(auth, googleProvider);
          } else {
            throw { ...popupError, message: handleAuthError(popupError) };
          }
        }
      }
    } catch (error) {
      throw { ...error, message: handleAuthError(error) };
    }
  };

  // Register with Email, Password and Full Name
  const registerWithEmail = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const registeredUser = userCredential.user;

      await updateProfile(registeredUser, { displayName: name });

      await setDoc(doc(db, "users", registeredUser.uid), {
        displayName: name,
        email: email,
        createdAt: new Date().toISOString()
      });

      return userCredential;
    } catch (error) {
      throw { ...error, message: handleAuthError(error) };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw { ...error, message: handleAuthError(error) };
    }
  };

  // Sign out
  const logout = async () => {
    setUserData({
      startingBalance: null,
      displayName: null,
      loading: false
    });
    await performDeepCleanup(auth);
    navigate("/login");
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
