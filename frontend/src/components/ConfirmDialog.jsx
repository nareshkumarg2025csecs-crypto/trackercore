import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-[92%] sm:w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-brand-danger/30 animate-modal">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-brand-danger/10 border-b border-brand-danger/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-brand-danger">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-extrabold font-heading text-[11px] sm:text-sm tracking-wider uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-brand-text/50 hover:text-brand-text p-1 rounded-lg hover:bg-brand-card transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <p className="text-[11px] sm:text-sm text-brand-text/80 leading-relaxed font-mono">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 sm:px-6 py-4 bg-brand-card/50 border-t border-[rgba(255,255,255,0.06)] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold text-brand-text/60 hover:text-brand-text hover:bg-brand-card border border-[rgba(255,255,255,0.1)] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold bg-brand-danger/20 text-brand-danger border border-brand-danger/40 hover:bg-brand-danger hover:text-white transition flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
