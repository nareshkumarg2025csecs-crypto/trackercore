import React from "react";

const SummaryCard = ({ title, value, icon: Icon, colorClass = "text-brand-accent", subtext }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-7 relative overflow-hidden transition-all duration-300">
      {/* Background soft glow decoration */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-brand-accent/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-brand-text/50 uppercase tracking-widest font-heading">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg bg-brand-bg/50 border border-brand-accent/10 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold font-mono tracking-tight text-brand-text neon-text-glow">
          {value}
        </h3>
        {subtext && (
          <p className="text-xs text-brand-text/40 font-mono truncate">{subtext}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
