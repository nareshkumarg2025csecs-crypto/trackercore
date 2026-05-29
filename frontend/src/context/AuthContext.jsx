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
  const [userData, setUserData] = useState({
    startingBalance: null,
    balanceSetDate: null,
    displayName: null,
    loading: true
  });

  // Monitor auth state changes
  useEffect(() => {
    let fired = false;
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed. User:", currentUser?.uid);
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch custom profile data
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              startingBalance: data.startingBalance ?? null,
              balanceSetDate: data.balanceSetDate ?? null,
              displayName: data.displayName ?? currentUser.displayName,
              loading: false
            });
          } else {
            console.log("No user document found in Firestore.");
            setUserData(prev => ({ ...prev, loading: false }));
          }
        } catch (error) {
          console.error("AuthContext Firestore Error:", error);
          setUserData(prev => ({ ...prev, loading: false }));
        }
      } else {
        setUserData({
          startingBalance: null,
          balanceSetDate: null,
          displayName: null,
          loading: false
        });
      }

      // Delay unmounting the initial loader for visual perfection
      if (!fired) {
        fired = true;
        console.log("Starting loader exit sequence...");
        setTimeout(() => {
          setExitingLoader(true);
          setTimeout(() => {
            console.log("Setting loading to false.");
            setLoading(false);
          }, 500); 
        }, 1500);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const saveStartingBalance = async (balance, date) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        startingBalance: parseFloat(balance),
        balanceSetDate: date
      }, { merge: true });
      
      setUserData(prev => ({
        ...prev,
        startingBalance: parseFloat(balance),
        balanceSetDate: date
      }));
    } catch (error) {
      console.error("Error saving terminal balance:", error);
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
      balanceSetDate: null,
      displayName: null,
      loading: false
    });
    return signOut(auth);
  };

  const value = {
    user,
    userData,
    saveStartingBalance,
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
