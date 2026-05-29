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
import { getTodayISTDateString, getLiveBankBalance } from "./utils/calculations";

// Lazy Pages for Route-Level Loader Animations
const Home = React.lazy(() => import("./pages/Home"));
const Tracker = React.lazy(() => import("./pages/Tracker"));
const Graphs = React.lazy(() => import("./pages/Graphs"));
const Tips = React.lazy(() => import("./pages/Tips"));
const Login = React.lazy(() => import("./pages/Login"));

const AppContent = () => {
  const { user, userData, saveStartingBalance: updateStartingBalance } = useAuth();

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
    addTransaction,
    editTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    clearAllTransactions,
  } = useTransactions(user?.uid, showToast);

  const startingBalance = userData.startingBalance;
  const lastBalanceUpdate = userData.balanceSetDate;

  // DB reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-accent/30 selection:text-brand-accent">
      
      {/* Sticky Header - active when startingBalance is set and user is authenticated */}
      {startingBalance !== null && user && <Navbar />}

      {/* Global Floating Toast Alert */}
      {toast.visible && user && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto sm:left-auto sm:right-6 sm:top-24 sm:translate-x-0 z-[100] animate-modal">
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
                    showToast={showToast}
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
                    Starting Balance: <span className="text-brand-text font-bold">₹{(startingBalance || 0).toFixed(2)}</span> | Rows: <span className="text-brand-text font-bold">{transactions.length}</span>
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
