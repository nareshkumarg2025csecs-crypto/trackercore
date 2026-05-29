import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useTransactions = (userUid, showToast) => {
  const [transactions, setTransactions] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Real-time listener for user's transactions subcollection
  useEffect(() => {
    if (!userUid) {
      setTransactions([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const transactionsRef = collection(db, "users", userUid, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transData);
      setIsDataLoading(false);
    }, (error) => {
      console.error("Firestore read error:", error);
      if (showToast) showToast("Failed to load your data, please check your connection", "error");
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!userUid) return;
    try {
      const transactionsRef = collection(db, "users", userUid, "transactions");
      const newDoc = {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        createdAt: new Date().toISOString()
      };
      await addDoc(transactionsRef, newDoc);
      if (showToast) showToast("Transaction Added", "success");
    } catch (error) {
      console.error("Error adding transaction:", error);
      if (showToast) showToast("Failed to save transaction", "error");
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
      if (showToast) showToast("Failed to update transaction", "error");
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
      if (showToast) showToast("Failed to delete transaction", "error");
    }
  };

  // Bulk delete transactions
  const bulkDeleteTransactions = async (ids) => {
    if (!userUid || !ids.length) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const ref = doc(db, "users", userUid, "transactions", id);
        batch.delete(ref);
      });
      await batch.commit();
      if (showToast) showToast("Selected Transactions Deleted", "error");
    } catch (error) {
      console.error("Error bulk deleting transactions:", error);
      if (showToast) showToast("Failed to delete selection", "error");
    }
  };

  // Import data
  const importTransactions = async (jsonString) => {
    if (!userUid) return false;
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      
      const batch = writeBatch(db);
      const transactionsRef = collection(db, "users", userUid, "transactions");
      
      data.forEach(item => {
        const newRef = doc(transactionsRef);
        batch.set(newRef, {
          ...item,
          amount: parseFloat(item.amount),
          createdAt: item.createdAt || new Date().toISOString()
        });
      });

      await batch.commit();
      if (showToast) showToast("Data Restored Successfully", "success");
      return true;
    } catch (error) {
      if (showToast) showToast(error.message || "Import Failed", "error");
      return false;
    }
  };

  return {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    importTransactions,
    isDataLoading
  };
};
