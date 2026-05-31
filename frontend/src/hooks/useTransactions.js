import { useState, useEffect } from "react";
import { 
  doc, 
  onSnapshot, 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useTransactions = (userUid, showToast) => {
  const [transactions, setTransactions] = useState([]);

  // Load transactions in real-time under users/{uid}/transactions
  useEffect(() => {
    if (!userUid) {
      setTransactions([]);
      return;
    }

    const transactionsRef = collection(db, "users", userUid, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transData);
    });

    return () => unsubscribe();
  }, [userUid]);

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!userUid) return;
    try {
      const transactionsRef = collection(db, "users", userUid, "transactions");
      const newTransaction = {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        createdAt: new Date().toISOString()
      };
      await addDoc(transactionsRef, newTransaction);
      if (showToast) showToast("Transaction Added", "success");
    } catch (error) {
      console.error("Error adding transaction:", error);
      if (showToast) showToast("Cloud Sync Failed", "error");
    }
  };

  // Edit transaction
  const editTransaction = async (id, updatedData) => {
    if (!userUid) return;
    try {
      const transactionRef = doc(db, "users", userUid, "transactions", id);
      await updateDoc(transactionRef, {
        ...updatedData,
        amount: parseFloat(updatedData.amount)
      });
      if (showToast) showToast("Transaction Updated", "success");
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (showToast) showToast("Update Failed", "error");
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!userUid) return;
    try {
      const transactionRef = doc(db, "users", userUid, "transactions", id);
      await deleteDoc(transactionRef);
      if (showToast) showToast("Transaction Deleted", "error");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      if (showToast) showToast("Deletion Failed", "error");
    }
  };

  // Bulk delete logic (individual deletes for Firestore integration)
  const bulkDeleteTransactions = async (ids) => {
    if (!userUid) return;
    try {
      for (const id of ids) {
        const transactionRef = doc(db, "users", userUid, "transactions", id);
        await deleteDoc(transactionRef);
      }
      if (showToast) showToast("Selected Transactions Deleted", "error");
    } catch (error) {
      console.error("Error bulk deleting:", error);
      if (showToast) showToast("Bulk Deletion Failed", "error");
    }
  };

  // Clear all transactions for this user
  const clearAllTransactions = async () => {
    if (!userUid) return;
    try {
      const transactionsRef = collection(db, "users", userUid, "transactions");
      const snapshot = await getDocs(transactionsRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      if (showToast) showToast("All Cloud Data Wiped", "error");
    } catch (error) {
      console.error("Error clearing data:", error);
      if (showToast) showToast("Wipe Failed", "error");
    }
  };

  return {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    clearAllTransactions
  };
};
