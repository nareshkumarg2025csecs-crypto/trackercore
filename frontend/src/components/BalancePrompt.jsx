import React, { useState } from "react";
import { Database, ArrowRight } from "lucide-react";

const BalancePrompt = ({ show, isNewUser, onSave, onKeep, isSaving }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0) {
      setError("Please enter a valid amount");
      return;
    }
    onSave(parsed);
    setInputValue("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-[92%] sm:w-full max-w-md bg-[#111a15] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-modal text-white">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-[#00e676]/10 rounded-full flex items-center justify-center mb-4">
            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-[#00e676]" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            {isNewUser ? "Welcome to TrackerCore" : "Good morning!"}
          </h1>
          <p className="text-[11px] sm:text-sm text-white/60">
            {isNewUser 
              ? "Enter your current bank balance to get started." 
              : "New day — would you like to update your opening balance?"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₹</span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError("");
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#00e676]/30 transition"
            />
          </div>
          {error && <p className="text-xs text-red-500 font-mono text-center">{error}</p>}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                isSaving 
                  ? "bg-white/10 text-white/30 cursor-wait" 
                  : "bg-[#00e676] text-[#111a15] hover:bg-[#00e676]/90"
              }`}
            >
              <span>{isSaving ? "Processing..." : (isNewUser ? "Initialize Ledger" : "Update Balance")}</span>
              {!isSaving && <ArrowRight className="h-4 w-4" />}
            </button>
            
            {!isNewUser && (
              <button
                type="button"
                onClick={onKeep}
                disabled={isSaving}
                className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
              >
                Keep Previous
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalancePrompt;