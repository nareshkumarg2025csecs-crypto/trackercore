import React from "react";
import { formatCurrency, formatDate } from "../utils/calculations";
import { ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";

// Helper to get payment mode badge
export const getPaymentModeBadge = (mode) => {
  switch (mode) {
    case "GPay":
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          G
        </span>
      );
    case "FamPay":
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
          F
        </span>
      );
    case "Cash":
      return (
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-sm font-semibold text-blue-400 border border-blue-500/20">
          💵
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-zinc-500/10 px-2 py-1 text-xs font-semibold text-zinc-400 border border-zinc-500/20">
          💳
        </span>
      );
  }
};

const TransactionCard = ({ transaction }) => {
  const { title, amount, type, category, paymentMode, date, note } = transaction;
  const isSaving = type === "saving";

  return (
    <div className="glass-panel rounded-xl p-4 flex items-center justify-between border-l-4 transition-all duration-300 hover:bg-brand-card/90 hover:border-l-brand-accent ${isSaving ? 'border-l-brand-accent' : 'border-l-brand-danger'}">
      <div className="flex items-center space-x-3 min-w-0">
        {/* Type Icon */}
        <div className={`p-2.5 rounded-lg shrink-0 ${isSaving ? 'bg-brand-accent/15 text-brand-accent' : 'bg-brand-danger/15 text-brand-danger'}`}>
          {isSaving ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
        </div>

        {/* Title, Date, Note */}
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-brand-text truncate">{title}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] text-brand-text/40 font-mono">
              {formatDate(date)}
            </span>
            <span className="text-[10px] text-brand-text/30">•</span>
            <span className="text-[10px] text-brand-text/50 font-semibold px-1.5 py-0.5 bg-brand-bg rounded-md border border-brand-accent/5">
              {category}
            </span>
          </div>
          {note && (
            <div className="flex items-center text-[10px] text-brand-text/40 mt-1.5 font-mono max-w-xs truncate">
              <FileText className="h-3 w-3 mr-1 text-brand-accent/60 shrink-0" />
              <span className="truncate">{note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount & Payment Mode */}
      <div className="flex flex-col items-end shrink-0 ml-3">
        <span className={`text-sm font-bold font-mono ${isSaving ? 'text-brand-accent' : 'text-brand-danger'}`}>
          {isSaving ? "+" : "-"}{formatCurrency(amount)}
        </span>
        <div className="mt-1 flex items-center space-x-1">
          <span className="text-[9px] text-brand-text/30 uppercase mr-1">PAY:</span>
          {getPaymentModeBadge(paymentMode)}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
