import React, { useState, useEffect } from "react";
import { Plus, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SummaryCard from "../components/SummaryCard";
import TransactionModal from "../components/TransactionModal";
import BalancePrompt from "../components/BalancePrompt";
import { useAuth } from "../context/AuthContext";
import { getTodayIST } from "../utils/dateIST";
import {
  getTodayExpensesTotal,
  getThisWeekExpensesTotal,
  getThisMonthExpensesTotal,
  getThisMonthSavingsTotal,
  getWeeklyChartData,
  getLiveBankBalance,
  formatCurrency,
  formatDate,
  getTodayISTDateString,
} from "../utils/calculations";

const Home = ({ transactions, startingBalance, onAddTransaction, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBalancePrompt, setShowBalancePrompt] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user, userData, saveStartingBalance } = useAuth();
  const userName = user?.displayName || "Operator";
  const [greeting, setGreeting] = useState("");

  // Balance prompt logic
  useEffect(() => {
    if (!userData.loading) {
      const today = getTodayIST();
      if (userData.startingBalance === null) {
        setIsNewUser(true);
        setShowBalancePrompt(true);
      } else if (userData.balanceSetDate !== today) {
        setIsNewUser(false);
        setShowBalancePrompt(true);
      } else {
        setShowBalancePrompt(false);
      }
    }
  }, [userData]);

  const handleSaveBalance = async (newBalance) => {
    setIsSaving(true);
    try {
      await saveStartingBalance(newBalance, getTodayIST());
      setShowBalancePrompt(false);
      showToast("Balance updated successfully");
    } catch (error) {
      console.error("Failed to save balance:", error);
      showToast("Cloud sync failed. Force closing modal for demo...", "error");
      // BYPASS: Force close modal even on error for UI viewing
      setTimeout(() => {
        setShowBalancePrompt(false);
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeepBalance = async () => {
    setIsSaving(true);
    try {
      await saveStartingBalance(userData.startingBalance, getTodayIST());
      setShowBalancePrompt(false);
      showToast("Balance synchronized");
    } catch (error) {
      console.error("Failed to update balance date:", error);
      showToast("Sync failed. Force closing...", "error");
      // BYPASS: Force close modal even on error for UI viewing
      setTimeout(() => {
        setShowBalancePrompt(false);
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine greeting based on local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Calculate statistics
  const liveBalance = getLiveBankBalance(transactions, startingBalance);
  const monthDeposited = getThisMonthSavingsTotal(transactions);
  const monthWithdrawn = getThisMonthExpensesTotal(transactions);

  const todayWithdrawn = getTodayExpensesTotal(transactions);
  const weekWithdrawn = getThisWeekExpensesTotal(transactions);
  const monthWithdrawnTotal = getThisMonthExpensesTotal(transactions);

  // Get recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Get 7-day spending data for the mini bar chart
  const barChartData = getWeeklyChartData(transactions);

  // Custom tooltips for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-card border border-[rgba(255,255,255,0.06)] p-3 rounded-lg text-xs font-mono">
          <p className="text-brand-text/40 mb-1">{payload[0].payload.date}</p>
          <p className="text-brand-accent font-bold">
            Withdrawn: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
      <BalancePrompt 
        show={showBalancePrompt} 
        isNewUser={isNewUser} 
        onSave={handleSaveBalance} 
        onKeep={handleKeepBalance} 
        isSaving={isSaving}
      />
      {/* 1. Welcoming Grid Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-brand-text/40">
            <Calendar className="h-4 w-4 text-brand-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {formatDate(getTodayISTDateString())}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text font-heading">
            {greeting}, {userName}
          </h1>
          <p className="text-xs text-brand-text/50 font-mono">
            Command terminal dashboard and capital reserves logs
          </p>
        </div>

        <div className="shrink-0 flex items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-accent text-brand-bg font-extrabold tracking-wider text-xs border border-brand-accent hover:bg-brand-accent/90 transition-all duration-200 font-heading cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>RECORD TRANSACTION</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent Live Bank Balance Card */}
      <div className="glass-panel rounded-3xl p-8 border border-[rgba(255,255,255,0.06)] text-center space-y-2">
        <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
          Available Bank Balance
        </span>
        <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-brand-text neon-text-glow">
          {formatCurrency(liveBalance)}
        </div>
      </div>

      {/* 3. Monthly Flows (Deposited / Withdrawn) side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposited */}
        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)] flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
              Deposited (Current Month)
            </span>
            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-brand-accent">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-brand-accent">
            {formatCurrency(monthDeposited)}
          </div>
        </div>

        {/* Withdrawn */}
        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)] flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
              Withdrawn (Current Month)
            </span>
            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-brand-danger">
              <ArrowDownLeft className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-brand-danger">
            {formatCurrency(monthWithdrawn)}
          </div>
        </div>
      </div>

      {/* 4. Three Summary Cards: Today, This Week, This Month Withdrawn */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold text-brand-text/40 uppercase tracking-wider font-heading">
          Outflow Summaries
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SummaryCard
            title="Today Withdrawn"
            value={formatCurrency(todayWithdrawn)}
            colorClass="text-brand-danger"
          />
          <SummaryCard
            title="This Week Withdrawn"
            value={formatCurrency(weekWithdrawn)}
            colorClass="text-brand-danger"
          />
          <SummaryCard
            title="This Month Withdrawn"
            value={formatCurrency(monthWithdrawnTotal)}
            colorClass="text-brand-danger"
          />
        </div>
      </div>

      {/* 5. Main Grid: Weekly Chart & Minimal table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[350px]">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-brand-text font-heading uppercase tracking-wide">
              Weekly Outflows
            </h2>
            <p className="text-[10px] text-brand-text/40 font-mono mt-0.5">
              Daily withdrawn statistics for the last 7 days
            </p>
          </div>

          <div className="flex-1 w-full min-h-[220px]">
            {transactions.filter((t) => t.type === "expense").length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-brand-text/30">
                No outflows recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="rgba(224, 255, 232, 0.2)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }}
                  />
                  <YAxis
                    stroke="rgba(224, 255, 232, 0.2)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 68, 68, 0.03)" }} />
                  <Bar
                    dataKey="amount"
                    fill="#ff4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                    className="cursor-pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Minimal Recent Activity Table */}
        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[350px]">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-brand-text font-heading uppercase tracking-wide">
              Recent Lines
            </h2>
            <p className="text-[10px] text-brand-text/40 font-mono mt-0.5">
              Last 5 transactions processed
            </p>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-brand-text/30">
                No active records in ledger
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {recentTransactions.map((t) => {
                    const isSaving = t.type === "saving";
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.01)]"
                      >
                        <td className="py-3.5 pr-2">
                          <div className={`p-1.5 rounded-md w-fit ${isSaving ? 'text-brand-accent bg-brand-accent/5' : 'text-brand-danger bg-brand-danger/5'}`}>
                            {isSaving ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 max-w-[100px] truncate text-xs font-semibold text-brand-text">
                          {t.title}
                        </td>
                        <td className="py-3.5 px-2 text-right text-xs font-mono font-bold">
                          <span className={isSaving ? "text-brand-accent" : "text-brand-danger"}>
                            {formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2 text-right text-[9px] font-mono text-brand-text/30">
                          {formatDate(t.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal dialog */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddTransaction}
      />
    </div>
  );
};

export default Home;
