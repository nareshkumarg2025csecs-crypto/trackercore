import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const useUserData = (uid) => {
  const [startingBalance, setStartingBalance] = useState(null);
  const [balanceSetDate, setBalanceSetDate] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        setStartingBalance(null);
        setBalanceSetDate(null);
        setDisplayName(null);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStartingBalance(data.startingBalance ?? null);
          setBalanceSetDate(data.balanceSetDate ?? null);
          setDisplayName(data.displayName ?? null);
        } else {
          // Document might not exist yet if newly registered
          setStartingBalance(null);
          setBalanceSetDate(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

  const saveStartingBalance = async (balance, date) => {
    if (!uid) return;
    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        startingBalance: parseFloat(balance),
        balanceSetDate: date
      }, { merge: true });
      
      setStartingBalance(parseFloat(balance));
      setBalanceSetDate(date);
    } catch (error) {
      console.error("Error saving starting balance:", error);
      throw error;
    }
  };

  return { startingBalance, balanceSetDate, displayName, saveStartingBalance, loading };
};