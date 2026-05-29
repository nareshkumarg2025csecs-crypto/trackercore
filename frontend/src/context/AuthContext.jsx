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
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
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

// Helper for IST Date
export const getISTDate = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date()).split("/").join("-");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exitingLoader, setExitingLoader] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Real-time listener for user document (startingBalance, balanceSetDate)
        unsubscribeSnapshot = onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          } else {
            setUserData(null);
          }
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setUserData(null);
      }

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

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Update starting balance in Firestore
  const updateStartingBalance = async (balance) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        startingBalance: parseFloat(balance),
        balanceSetDate: getISTDate()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating balance:", error);
      throw error;
    }
  };

  // Skip updating balance for today (Keep Previous)
  const skipBalanceUpdate = async () => {
    if (!user || !userData) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        balanceSetDate: getISTDate()
      }, { merge: true });
    } catch (error) {
      console.error("Error skipping balance update:", error);
      throw error;
    }
  };

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
        createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    });

    return userCredential;
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Sign out
  const logout = async () => {
    setUserData(null); // Clear local data state
    return signOut(auth);
  };

  const value = {
    user,
    userData,
    loading,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    resetPassword,
    logout,
    updateStartingBalance,
    skipBalanceUpdate,
    getISTDate
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && <LoadingScreen isExiting={exitingLoader} />}
      {!loading && children}
    </AuthContext.Provider>
  );
};
