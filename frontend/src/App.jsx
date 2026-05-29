import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Database, Trash2, CheckCircle2, AlertOctagon, ArrowRight } from "lucide-react";

// Components
import Navbar from "./components/Navbar";
import Calculator from "./components/Calculator";
import ConfirmDialog from "./components/ConfirmDialog";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

// Context & Hooks
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTransactions } from "./hooks/useTransactions";

// Lazy Pages for Route-Level Loader Animations
const Home = React.lazy(() => import("./pages/Home"));
const Tracker = React.lazy(() => import("./pages/Tracker"));
const Graphs = React.lazy(() => import("./pages/Graphs"));
const Tips = React.lazy(() => import("./pages/Tips"));
const Login = React.lazy(() => import("./pages/Login"));

const AppContent = () => {
  const { user, userData, updateStartingBalance, skipBalanceUpdate, getISTDate } = useAuth();

  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Central State Hook - Scoped by logged-in user's UID!
  const {
    transactions,
    isDataLoading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    importTransactions,
  } = useTransactions(user?.uid, showToast);

  // Welcome modal balance field
  const [tempBalance, setTempBalance] = useState("");
  const [balanceError, setBalanceError] = useState("");

  // Daily Update Balance Prompt State
  const [showDailyPrompt, setShowDailyPrompt] = useState(false);

  // Starting balance logic (Persistent from Firestore)
  const startingBalance = userData?.startingBalance ?? null;
  const balanceSetDate = userData?.balanceSetDate ?? null;

  // Effect to check for daily balance update prompt
  React.useEffect(() => {
    if (user && userData) {
      const today = getISTDate();
      // If we have a balance but it wasn't set today, show the daily prompt
      if (startingBalance !== null && balanceSetDate !== today) {
        setShowDailyPrompt(true);
      } else {
        setShowDailyPrompt(false);
      }
    }
  }, [user, userData, startingBalance, balanceSetDate]);

  const handleInitializeBalance = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(tempBalance);
    if (isNaN(parsed) || parsed < 0) {
      setBalanceError("Please enter a valid starting balance (0 or higher).");
      return;
    }
    try {
      await updateStartingBalance(parsed);
      setShowDailyPrompt(false);
      setTempBalance("");
      showToast("Balance Updated Successfully ✅", "success");
    } catch (err) {
      showToast("Failed to update balance", "error");
    }
  };

  const handleKeepPreviousBalance = async () => {
    try {
      await skipBalanceUpdate();
      setShowDailyPrompt(false);
      showToast("Previous Balance Retained", "success");
    } catch (err) {
      showToast("Action failed", "error");
    }
  };

  if (user && isDataLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-accent/30 selection:text-brand-accent">
      
      {/* Sticky Header - active when startingBalance is set and user is authenticated */}
      {startingBalance !== null && user && !showDailyPrompt && <Navbar />}

      {/* FULL-SCREEN WELCOME BALANCE MODAL (FOR NEW USERS) */}
      {user && startingBalance === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg p-4">
          <div className="max-w-md w-full bg-brand-card border border-[rgba(255,255,255,0.06)] rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-bold tracking-wider font-heading uppercase text-brand-text">
                Welcome to TrackerCore
              </h1>
              <p className="text-xs text-brand-text/50 font-mono">
                Initialize your personal finance terminal ledger
              </p>
            </div>

            <form onSubmit={handleInitializeBalance} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text/50 font-mono">
                  Current Bank Balance
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 font-mono text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={tempBalance}
                    onChange={(e) => {
                      setTempBalance(e.target.value);
                      setBalanceError("");
                    }}
                    className="w-full bg-brand-bg/50 border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-3 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-accent/30 transition"
                  />
                </div>
                {balanceError && (
                  <p className="text-[10px] font-mono text-brand-danger mt-1">{balanceError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-accent text-brand-bg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-brand-accent/90 transition cursor-pointer"
              >
                <span>Initialize Ledger</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTLE DAILY BALANCE UPDATE MODAL (FOR EXISTING USERS ON NEW DAY) */}
      {user && showDailyPrompt && startingBalance !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-brand-card border border-brand-accent/20 rounded-3xl p-8 space-y-6 shadow-2xl animate-modal">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-brand-accent" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-brand-text">
                Good morning, {user.displayName?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-brand-text/60">
                Would you like to update today's opening balance?
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 font-mono text-sm">₹</span>
                <input
                  type="number"
                  placeholder={startingBalance.toFixed(2)}
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-3 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-accent/30 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleKeepPreviousBalance}
                  className="py-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-brand-text/60 font-mono text-[10px] uppercase font-bold hover:bg-white/5 transition"
                >
                  Keep Previous
                </button>
                <button
                  onClick={handleInitializeBalance}
                  className="py-3 rounded-xl bg-brand-accent text-brand-bg font-mono text-[10px] uppercase font-bold hover:bg-brand-accent/90 transition"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating Toast Alert */}
      {toast.visible && user && (
        <div className="fixed top-24 right-6 z-50 animate-modal">
          <div className={`glass-panel rounded-xl px-4 py-3 flex items-center space-x-3 shadow-2xl border ${
            toast.type === "success"
              ? "border-brand-accent/40 bg-brand-accent/5 text-brand-accent"
              : "border-brand-danger/40 bg-brand-danger/5 text-brand-danger"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" />
            ) : (
              <AlertOctagon className="h-4 w-4 shrink-0 text-brand-danger" />
            )}
            <span className="text-xs font-mono font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Primary Page Grid */}
      <main className="flex-1 pb-16">
        <React.Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Guest Authentication Route */}
            <Route path="/login" element={<Login showToast={showToast} />} />

            {/* Protected Core Dashboard Pages */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home
                    transactions={transactions}
                    startingBalance={startingBalance}
                    onAddTransaction={addTransaction}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracker"
              element={
                <ProtectedRoute>
                  <Tracker
                    transactions={transactions}
                    startingBalance={startingBalance}
                    onAddTransaction={addTransaction}
                    onEditTransaction={editTransaction}
                    onDeleteTransaction={deleteTransaction}
                    onBulkDeleteTransactions={bulkDeleteTransactions}
                    showToast={showToast}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/graphs"
              element={
                <ProtectedRoute>
                  <Graphs transactions={transactions} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tips"
              element={
                <ProtectedRoute>
                  <Tips transactions={transactions} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </React.Suspense>
      </main>

      {/* Global Floating Calculator Widget */}
      {startingBalance !== null && user && <Calculator />}

      {/* Core Database Stats Footer Panel */}
      {startingBalance !== null && user && (
        <footer className="mt-auto border-t border-[rgba(255,255,255,0.06)] bg-brand-card/30 py-6 text-brand-text/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left side stats */}
              <div className="flex items-center space-x-3 text-left font-mono">
                <div className="p-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg text-brand-text/50">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[9px] text-brand-text/40 uppercase tracking-wider font-heading font-semibold">
                    Ledger Database
                  </div>
                  <div className="text-[10px] text-brand-text/60 mt-0.5">
                    Starting Balance: <span className="text-brand-text font-bold">₹{startingBalance.toFixed(2)}</span> | Rows: <span className="text-brand-text font-bold">{transactions.length}</span>
                  </div>
                </div>
              </div>

              {/* Right side command actions */}
              <div>
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-brand-danger/10 border border-brand-danger/20 hover:bg-brand-danger hover:text-white text-brand-danger text-xs font-bold font-mono transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>RESET TERMINAL</span>
                </button>
              </div>

            </div>
            
            <div className="mt-4 text-center border-t border-[rgba(255,255,255,0.03)] pt-4 text-[9px] font-mono text-brand-text/20">
              TrackerCore Financial Command Terminal. Operating in Asia/Kolkata timezone.
            </div>
          </div>
        </footer>
      )}

      {/* Global Reset Dialog Overlay */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Clear Database"
        message="This action will permanently wipe your starting balance and all transaction history from your local browser ledger. This operation cannot be undone."
        onConfirm={() => {
          clearAllTransactions();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
        confirmText="Clear Ledger"
      />

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};
export default App;
