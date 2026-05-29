import { useState, useEffect } from "react";
import {
  getTransactions,
  saveTransactions,
  clearTransactions,
  validateAndImportTransactions,
  getStartingBalance,
  setStartingBalance,
} from "../utils/localStorage";

export const useTransactions = (userUid, showToast) => {
  const [transactions, setTransactions] = useState([]);
  const [startingBalance, setStartingBalanceState] = useState(null);

  // Load transactions and balance when userUid changes
  useEffect(() => {
    if (userUid) {
      setTransactions(getTransactions(userUid));
      setStartingBalanceState(getStartingBalance(userUid));
    } else {
      setTransactions([]);
      setStartingBalanceState(null);
    }
  }, [userUid]);

  // Helper to update state and localStorage
  const updateTransactionsState = (newTransactions) => {
    setTransactions(newTransactions);
    saveTransactions(newTransactions, userUid);
  };

  // Update starting balance
  const updateStartingBalance = (val) => {
    const parsed = parseFloat(val);
    setStartingBalanceState(parsed);
    setStartingBalance(parsed, userUid);
    if (showToast) showToast("Starting Balance Configured ✅", "success");
  };

  // Add transaction
  const addTransaction = (transactionData) => {
    const newTransaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      amount: parseFloat(transactionData.amount),
    };
    const updated = [newTransaction, ...transactions];
    updateTransactionsState(updated);
    if (showToast) showToast("Transaction Added", "success");
    return newTransaction;
  };

  // Edit transaction
  const editTransaction = (id, updatedData) => {
    const updated = transactions.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updatedData,
            amount: parseFloat(updatedData.amount),
          }
        : t
    );
    updateTransactionsState(updated);
    if (showToast) showToast("Transaction Updated", "success");
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    updateTransactionsState(updated);
    if (showToast) showToast("Transaction Deleted", "error");
  };

  // Bulk delete transactions
  const bulkDeleteTransactions = (ids) => {
    const updated = transactions.filter((t) => !ids.includes(t.id));
    updateTransactionsState(updated);
    if (showToast) showToast("Selected Transactions Deleted", "error");
  };

  // Clear all data
  const clearAllTransactions = () => {
    clearTransactions(userUid);
    setTransactions([]);
    setStartingBalanceState(null);
    if (showToast) showToast("All Data Cleared", "error");
  };

  // Import data
  const importTransactions = (jsonString) => {
    try {
      const imported = validateAndImportTransactions(jsonString);
      updateTransactionsState(imported);
      if (showToast) showToast("Data Restored Successfully", "success");
      return true;
    } catch (error) {
      if (showToast) showToast(error.message || "Import Failed", "error");
      return false;
    }
  };

  return {
    transactions,
    startingBalance,
    updateStartingBalance,
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    clearAllTransactions,
    importTransactions,
  };
};
