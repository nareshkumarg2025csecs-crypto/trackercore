import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getTodayISTDateString } from "../utils/calculations";

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null }) => {
  const isEdit = !!transaction;

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // expense = Withdrawal, saving = Deposit
  const [category, setCategory] = useState("Food");
  const [paymentMode, setPaymentMode] = useState("GPay");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  // Error state
  const [error, setError] = useState("");

  // Reset fields to defaults or fill with editing transaction
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setTitle(transaction.title);
        setAmount(transaction.amount.toString());
        setType(transaction.type);
        setCategory(transaction.category);
        setPaymentMode(transaction.paymentMode);
        setDate(transaction.date);
        setNote(transaction.note || "");
      } else {
        // Defaults for Add Mode using IST today
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory("Food");
        setPaymentMode("GPay");
        setDate(getTodayISTDateString());
        setNote("");
      }
      setError("");
    }
  }, [isOpen, transaction]);

  if (!isOpen) return null;

  // Handle category autosuggestion based on type
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === "saving") {
      setCategory("Savings");
    } else if (category === "Savings") {
      setCategory("Food");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Form validations
    if (!title.trim()) {
      setError("Description cannot be empty.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    const todayStr = getTodayISTDateString();
    if (date > todayStr) {
      setError("Transaction date cannot be in the future.");
      return;
    }

    // Call onSave with form data
    onSave({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: type === "saving" ? "Savings" : category,
      paymentMode,
      date,
      note: note.trim(),
    });

    onClose();
  };

  const categories = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Recharge", "Savings", "Other"];
  const paymentModes = ["GPay", "FamPay", "Cash", "Other"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.06)] animate-modal">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-brand-card">
          <h3 className="font-bold font-heading text-sm tracking-wider uppercase text-brand-text">
            {isEdit ? "Edit Transaction" : "Record Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="text-brand-text/50 hover:text-brand-text p-1 rounded-lg hover:bg-brand-bg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-mono rounded-lg">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-2 font-heading">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-brand-bg p-1 rounded-xl border border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() => handleTypeChange("saving")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === "saving"
                    ? "bg-brand-accent text-brand-bg"
                    : "text-brand-text/40 hover:text-brand-text"
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === "expense"
                    ? "bg-brand-danger text-white"
                    : "text-brand-text/40 hover:text-brand-text"
                }`}
              >
                Withdrawal
              </button>
            </div>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
                Description
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Particulars"
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition"
              />
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
                Category
              </label>
              <select
                id="category"
                value={type === "saving" ? "Savings" : category}
                disabled={type === "saving"}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 disabled:opacity-40"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="paymentMode" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
                Payment Mode
              </label>
              <select
                id="paymentMode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30"
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="date" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
              Transaction Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              max={getTodayISTDateString()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition"
            />
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="note" className="block text-[10px] font-bold text-brand-text/40 uppercase tracking-wider mb-1.5 font-heading">
              Notes
            </label>
            <textarea
              id="note"
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes"
              className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-brand-text/60 hover:text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.06)] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-accent text-brand-bg border border-brand-accent hover:bg-brand-accent/90 transition font-heading tracking-wider cursor-pointer"
            >
              {isEdit ? "SAVE CHANGES" : "ADD TRANSACTION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
