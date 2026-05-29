import { useState, useEffect } from "react";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  getDoc 
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useTransactions = (userUid, showToast) => {
  const [transactions, setTransactions] = useState([]);
  const [startingBalance, setStartingBalanceState] = useState(null);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for user data in Firestore
  useEffect(() => {
    if (!userUid) {
      setTransactions([]);
      setStartingBalanceState(null);
      setLastBalanceUpdate(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", userUid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTransactions(data.transactions || []);
        setStartingBalanceState(data.startingBalance || null);
        setLastBalanceUpdate(data.lastBalanceUpdate || null);
      } else {
        // Initialize user document if it doesn't exist
        setDoc(docRef, {
          transactions: [],
          startingBalance: null,
          lastBalanceUpdate: null,
          createdAt: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  // Update starting balance in Firestore
  const updateStartingBalance = async (val) => {
    if (!userUid) return;
    try {
      const parsed = parseFloat(val);
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, { 
        startingBalance: parsed,
        lastBalanceUpdate: new Date().toISOString()
      });
      setStartingBalanceState(parsed);
      if (showToast) showToast("Terminal Balance Configured ✅", "success");
    } catch (error) {
      console.error("Error updating balance:", error);
      if (showToast) showToast("Failed to update balance", "error");
    }
  };

  // Add transaction to Firestore
  const addTransaction = async (transactionData) => {
    if (!userUid) return;
    try {
      const newTransaction = {
        ...transactionData,
        id: crypto.randomUUID(),
        amount: parseFloat(transactionData.amount),
        timestamp: new Date().toISOString(),
      };

      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, {
        transactions: arrayUnion(newTransaction)
      });

      if (showToast) showToast("Transaction Logged to Cloud", "success");
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      if (showToast) showToast("Cloud Sync Failed", "error");
    }
  };

  // Edit transaction in Firestore
  const editTransaction = async (id, updatedData) => {
    if (!userUid) return;
    try {
      const updatedTransactions = transactions.map((t) =>
        t.id === id
          ? { ...t, ...updatedData, amount: parseFloat(updatedData.amount) }
          : t
      );

      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, { transactions: updatedTransactions });

      if (showToast) showToast("Cloud Record Updated", "success");
    } catch (error) {
      console.error("Error editing transaction:", error);
      if (showToast) showToast("Update Failed", "error");
    }
  };

  // Delete transaction from Firestore
  const deleteTransaction = async (id) => {
    if (!userUid) return;
    try {
      const updatedTransactions = transactions.filter((t) => t.id !== id);
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, { transactions: updatedTransactions });

      if (showToast) showToast("Record Deleted from Cloud", "error");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      if (showToast) showToast("Deletion Failed", "error");
    }
  };

  // Bulk delete transactions in Firestore
  const bulkDeleteTransactions = async (ids) => {
    if (!userUid) return;
    try {
      const updatedTransactions = transactions.filter((t) => !ids.includes(t.id));
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, { transactions: updatedTransactions });

      if (showToast) showToast("Selected Records Purged", "error");
    } catch (error) {
      console.error("Error bulk deleting:", error);
      if (showToast) showToast("Purge Failed", "error");
    }
  };

  // Clear all data in Firestore
  const clearAllTransactions = async () => {
    if (!userUid) return;
    try {
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, {
        transactions: [],
        startingBalance: null
      });

      if (showToast) showToast("All Cloud Data Wiped", "error");
    } catch (error) {
      console.error("Error clearing data:", error);
      if (showToast) showToast("Wipe Failed", "error");
    }
  };

  // Import data to Firestore
  const importTransactions = async (jsonString) => {
    if (!userUid) return false;
    try {
      const imported = JSON.parse(jsonString);
      if (!Array.isArray(imported)) throw new Error("Invalid Format");

      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, { transactions: imported });

      if (showToast) showToast("Cloud Restoration Complete", "success");
      return true;
    } catch (error) {
      if (showToast) showToast("Restoration Failed", "error");
      return false;
    }
  };

  return {
    transactions,
    startingBalance,
    lastBalanceUpdate,
    loading,
    updateStartingBalance,
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    clearAllTransactions,
    importTransactions,
  };
};
