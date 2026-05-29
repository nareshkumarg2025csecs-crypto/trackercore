// Local Storage Data Management for TrackerCore

const getStorageKey = (uid) => uid ? `${uid}_expense_tracker_data` : "expense_tracker_data";
const getBalanceKey = (uid) => uid ? `${uid}_starting_balance` : "starting_balance";

// Retrieve starting bank balance
export const getStartingBalance = (uid) => {
  try {
    const val = localStorage.getItem(getBalanceKey(uid));
    return val !== null ? parseFloat(val) : null;
  } catch (error) {
    console.error("Error reading starting balance:", error);
    return null;
  }
};

// Set starting bank balance
export const setStartingBalance = (val, uid) => {
  try {
    localStorage.setItem(getBalanceKey(uid), val.toString());
    return true;
  } catch (error) {
    console.error("Error writing starting balance:", error);
    return false;
  }
};

// Retrieve transactions from localStorage
export const getTransactions = (uid) => {
  try {
    const data = localStorage.getItem(getStorageKey(uid));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

// Save transactions to localStorage
export const saveTransactions = (transactions, uid) => {
  try {
    localStorage.setItem(getStorageKey(uid), JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error("Error writing to localStorage:", error);
    return false;
  }
};

// Clear all data
export const clearTransactions = (uid) => {
  try {
    localStorage.removeItem(getStorageKey(uid));
    localStorage.removeItem(getBalanceKey(uid));
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

// Export transactions as a downloadable JSON file
export const exportTransactionsToJSON = (transactions) => {
  try {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `expense_tracker_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error exporting JSON:", error);
    return false;
  }
};

// Import transactions from JSON content (validate format)
export const validateAndImportTransactions = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("Data must be an array of transactions.");

    const validCategories = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Recharge", "Savings", "Other"];
    const validPaymentModes = ["GPay", "FamPay", "Cash", "Other"];
    const validTypes = ["expense", "saving"];

    // Validate each transaction structure
    const validated = parsed.map((item) => {
      if (!item.id || typeof item.id !== "string") {
        item.id = crypto.randomUUID();
      }
      if (typeof item.title !== "string" || !item.title.trim()) {
        throw new Error("Invalid title in transaction record");
      }
      const amount = Number(item.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount in transaction: ${item.title}`);
      }
      if (!validTypes.includes(item.type)) {
        throw new Error(`Invalid type in transaction: ${item.title}`);
      }
      if (!validCategories.includes(item.category)) {
        item.category = "Other";
      }
      if (!validPaymentModes.includes(item.paymentMode)) {
        item.paymentMode = "Other";
      }
      if (!item.date || isNaN(Date.parse(item.date))) {
        item.date = new Date().toISOString().split("T")[0];
      }
      return {
        id: item.id,
        title: item.title.trim(),
        amount: Number(amount),
        type: item.type,
        category: item.category,
        paymentMode: item.paymentMode,
        date: item.date,
        note: typeof item.note === "string" ? item.note.trim() : "",
      };
    });

    return validated;
  } catch (error) {
    throw new Error("Import failed: " + error.message);
  }
};
