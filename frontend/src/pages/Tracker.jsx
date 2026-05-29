import React, { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Download, Filter, RotateCcw, Calendar } from "lucide-react";
import TransactionModal from "../components/TransactionModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency, formatDate, computeRunningBalances } from "../utils/calculations";
import { generatePDFReport } from "../utils/pdfGenerator";

const Tracker = ({
  transactions,
  startingBalance,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onBulkDeleteTransactions,
  showToast,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [paymentMode, setPaymentMode] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const categories = ["All", "Food", "Transport", "Shopping", "Entertainment", "Health", "Recharge", "Savings", "Other"];
  const paymentModes = ["All", "GPay", "FamPay", "Cash", "Other"];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = category === "All" || t.category === category;
      const matchesPaymentMode = paymentMode === "All" || t.paymentMode === paymentMode;

      let matchesFrom = true;
      let matchesTo = true;
      if (fromDate) matchesFrom = t.date >= fromDate;
      if (toDate) matchesTo = t.date <= toDate;

      return matchesSearch && matchesCategory && matchesPaymentMode && matchesFrom && matchesTo;
    });
  }, [transactions, search, category, paymentMode, fromDate, toDate]);

  // Compute chronological running balance lookup table
  const runningBalances = useMemo(() => {
    return computeRunningBalances(transactions, startingBalance);
  }, [transactions, startingBalance]);

  // Filter tally calculations
  const tally = useMemo(() => {
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = filteredTransactions
      .filter((t) => t.type === "saving")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      expenses,
      savings,
      balance: savings - expenses,
    };
  }, [filteredTransactions]);

  // Bulk checkboxes handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Add handlers
  const handleSaveAdd = (data) => {
    onAddTransaction(data);
  };

  // Edit handlers
  const handleOpenEdit = (t) => {
    setEditingTransaction(t);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (data) => {
    if (editingTransaction) {
      onEditTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    }
  };

  // Delete handlers
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteTransaction(deletingId);
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      setDeletingId(null);
    }
    setIsConfirmOpen(false);
  };

  const handleConfirmBulkDelete = () => {
    onBulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
    setIsBulkConfirmOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setPaymentMode("All");
    setFromDate("");
    setToDate("");
  };

  // PDF Export Trigger (Weekly)
  const handleExportWeeklyPDF = () => {
    const getStartOfWeekIST = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff));
    };

    const today = new Date();
    const startOfWeek = getStartOfWeekIST(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const fromStr = formatter.format(startOfWeek);
    const toStr = formatter.format(endOfWeek);

    const weeklyTransactions = transactions.filter(
      (t) => t.date >= fromStr && t.date <= toStr
    );

    generatePDFReport(
      transactions,
      weeklyTransactions,
      startingBalance,
      "Weekly Activity Ledger",
      `${formatDate(fromStr)} to ${formatDate(toStr)}`,
      showToast
    );
  };

  // PDF Export Trigger (Monthly)
  const handleExportMonthlyPDF = () => {
    const today = new Date();
    const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
    const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
    
    const targetYear = parseInt(formatterYear.format(today), 10);
    const targetMonth = parseInt(formatterMonth.format(today), 10) - 1; // 0-indexed

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const fromStr = formatter.format(startOfMonth);
    const toStr = formatter.format(endOfMonth);

    const monthlyTransactions = transactions.filter(
      (t) => t.date >= fromStr && t.date <= toStr
    );

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    generatePDFReport(
      transactions,
      monthlyTransactions,
      startingBalance,
      `${monthNames[targetMonth]} ${targetYear} Ledger`,
      `${formatDate(fromStr)} to ${formatDate(toStr)}`,
      showToast
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-1">
          <h1 className="text-lg md:text-2xl font-bold tracking-wider text-brand-text font-heading uppercase text-left">
            Ledger Terminal
          </h1>
          <p className="text-[10px] md:text-xs text-brand-text/50 font-mono text-left">
            Transactional ledger logs and export tools
          </p>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3">
          <button
            onClick={handleExportWeeklyPDF}
            className="flex items-center justify-center space-x-1.5 px-3 md:px-4 py-2.5 rounded-xl bg-brand-card border border-[rgba(255,255,255,0.08)] hover:border-brand-accent/40 text-brand-accent text-[10px] md:text-xs font-bold font-mono transition cursor-pointer"
          >
            <Download className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span>WEEKLY PDF</span>
          </button>
          
          <button
            onClick={handleExportMonthlyPDF}
            className="flex items-center justify-center space-x-1.5 px-3 md:px-4 py-2.5 rounded-xl bg-brand-card border border-[rgba(255,255,255,0.08)] hover:border-brand-accent/40 text-brand-accent text-[10px] md:text-xs font-bold font-mono transition cursor-pointer"
          >
            <Download className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span>MONTHLY PDF</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="col-span-2 md:col-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-accent text-brand-bg text-[10px] md:text-xs font-bold hover:bg-brand-accent/90 transition-all font-heading cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>NEW ENTRY</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal single-row Filter Bar */}
      <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
          
          {/* Search particular */}
          <div className="sm:col-span-2 md:col-span-2 relative text-left">
            <label className="block text-[8px] md:text-[9px] font-bold text-brand-text/40 uppercase font-heading mb-1.5">
              Description Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-3 py-2 text-[11px] md:text-xs text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition shadow-inner"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text/30" />
            </div>
          </div>

          {/* Category drop */}
          <div className="text-left">
            <label className="block text-[8px] md:text-[9px] font-bold text-brand-text/40 uppercase font-heading mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-[11px] md:text-xs text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mode drop */}
          <div className="text-left">
            <label className="block text-[8px] md:text-[9px] font-bold text-brand-text/40 uppercase font-heading mb-1.5">
              Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-[11px] md:text-xs text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition shadow-inner"
            >
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="text-left">
            <label className="block text-[8px] md:text-[9px] font-bold text-brand-text/40 uppercase font-heading mb-1.5">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-[11px] md:text-xs text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition shadow-inner"
            />
          </div>

          {/* Date to & reset */}
          <div className="flex gap-2 text-left">
            <div className="flex-1">
              <label className="block text-[8px] md:text-[9px] font-bold text-brand-text/40 uppercase font-heading mb-1.5">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-brand-bg border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-[11px] md:text-xs text-brand-text font-mono focus:outline-none focus:border-brand-accent/30 transition shadow-inner"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-brand-card hover:bg-brand-bg border border-[rgba(255,255,255,0.08)] hover:border-brand-accent/30 text-brand-text/40 hover:text-brand-accent transition shrink-0 cursor-pointer self-end"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Bulk triggers */}
      {selectedIds.length > 0 && (
        <div className="flex items-center space-x-2 animate-modal grow">
          <button
            onClick={() => setIsBulkConfirmOpen(true)}
            className="w-full md:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-danger/10 border border-brand-danger/25 hover:bg-brand-danger hover:text-white text-brand-danger text-[10px] md:text-xs font-bold font-mono transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>DELETE SELECTED ({selectedIds.length})</span>
          </button>
        </div>
      )}

      {/* 3. Very Wide and Spacious Transactions Ledger Table */}
      <div className="glass-panel rounded-2xl md:rounded-3xl border border-[rgba(255,255,255,0.06)] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-brand-accent/20">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[900px]">
            <thead>
              <tr className="bg-brand-card/80 border-b border-[rgba(255,255,255,0.06)] text-[9px] md:text-[10px] font-bold font-heading text-brand-accent uppercase tracking-widest">
                <th className="py-4 md:py-5 px-4 md:px-6 w-14 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedIds.length === filteredTransactions.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded bg-brand-bg border-[rgba(255,255,255,0.08)] accent-brand-accent cursor-pointer focus:ring-0"
                  />
                </th>
                <th className="py-4 md:py-5 px-4 md:px-6">Date</th>
                <th className="py-4 md:py-5 px-4 md:px-6">Description</th>
                <th className="py-4 md:py-5 px-4 md:px-6">Category</th>
                <th className="py-4 md:py-5 px-4 md:px-6">Mode</th>
                <th className="py-4 md:py-5 px-4 md:px-6 text-right">Deposited</th>
                <th className="py-4 md:py-5 px-4 md:px-6 text-right">Withdrawn</th>
                <th className="py-4 md:py-5 px-4 md:px-6 text-right">Balance</th>
                <th className="py-4 md:py-5 px-4 md:px-6 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)] font-mono text-[10px] md:text-xs text-brand-text/90">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 px-6 text-center text-brand-text/30">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Calendar className="h-8 w-8 text-brand-accent/20" />
                      <span>No matching entries found in active ledger scope</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => {
                  const isSaving = t.type === "saving";
                  const isSelected = selectedIds.includes(t.id);
                  const balanceVal = runningBalances[t.id] !== undefined ? runningBalances[t.id] : startingBalance;

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-[rgba(255,255,255,0.01)] transition-colors even:bg-[rgba(255,255,255,0.005)] ${
                        isSelected ? "bg-brand-accent/5 hover:bg-brand-accent/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(t.id, e.target.checked)}
                          className="h-4 w-4 rounded bg-brand-bg border-[rgba(255,255,255,0.08)] accent-brand-accent cursor-pointer focus:ring-0"
                        />
                      </td>

                      {/* Date */}
                      <td className="py-4 md:py-5 px-4 md:px-6 whitespace-nowrap text-brand-text/40 font-semibold">
                        {formatDate(t.date)}
                      </td>

                      {/* Description particulars */}
                      <td className="py-4 md:py-5 px-4 md:px-6">
                        <div className="font-bold text-brand-text">{t.title}</div>
                        {t.note && (
                          <div className="text-[9px] md:text-[10px] text-brand-text/30 mt-0.5 truncate max-w-[80px] md:max-w-xs">
                            {t.note}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 md:py-5 px-4 md:px-6 whitespace-nowrap text-left">
                        <span className="text-[9px] md:text-[10px] font-semibold text-brand-text/60">
                          {t.category}
                        </span>
                      </td>

                      {/* Mode */}
                      <td className="py-4 md:py-5 px-4 md:px-6 whitespace-nowrap text-brand-text/50">
                        {t.paymentMode}
                      </td>

                      {/* Deposited */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-right whitespace-nowrap font-bold text-brand-accent">
                        {isSaving ? formatCurrency(t.amount) : "-"}
                      </td>

                      {/* Withdrawn */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-right whitespace-nowrap font-bold text-brand-danger">
                        {!isSaving ? formatCurrency(t.amount) : "-"}
                      </td>

                      {/* Running Balance */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-right whitespace-nowrap font-bold text-brand-text">
                        {formatCurrency(balanceVal)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg bg-brand-card hover:bg-brand-bg text-brand-text/40 hover:text-brand-accent border border-[rgba(255,255,255,0.06)] transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(t.id)}
                            className="p-1.5 rounded-lg bg-brand-card hover:bg-brand-danger/10 text-brand-text/40 hover:text-brand-danger border border-[rgba(255,255,255,0.06)] transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Spacious Filter Tally stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
            Filtered Total Withdrawn
          </span>
          <div className="text-xl font-bold font-mono text-brand-danger mt-2">
            {formatCurrency(tally.expenses)}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
            Filtered Total Deposited
          </span>
          <div className="text-xl font-bold font-mono text-brand-accent mt-2">
            {formatCurrency(tally.savings)}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-7 border border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest font-heading">
            Filtered Net Reserves Flow
          </span>
          <div className={`text-xl font-bold font-mono mt-2 ${tally.balance >= 0 ? "text-brand-accent" : "text-brand-danger"}`}>
            {tally.balance >= 0 ? "+" : ""}{formatCurrency(tally.balance)}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAdd}
      />

      {/* Edit Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record? This action cannot be reverted."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={isBulkConfirmOpen}
        title="Bulk Delete"
        message={`Are you sure you want to delete all ${selectedIds.length} selected transactions? This will permanently wipe them from the local storage database.`}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkConfirmOpen(false)}
      />

    </div>
  );
};

export default Tracker;
