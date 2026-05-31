import React from "react";
import CountUp from "./CountUp";

const SummaryCard = ({ title, value, numericValue, icon: Icon, colorClass = "text-brand-accent", subtext }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-7 relative overflow-hidden transition-all duration-300">
      {/* Background soft glow decoration */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-brand-accent/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3 text-left">
        <span className="text-[10px] sm:text-xs font-semibold text-brand-text/50 uppercase tracking-widest font-heading">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 sm:p-2 rounded-lg bg-brand-bg/50 border border-brand-accent/10 ${colorClass}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>

      <div className="space-y-1 text-left">
        <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-brand-text neon-text-glow truncate">
          {numericValue !== undefined ? (
            <span>
              ₹
              <CountUp
                key={numericValue}
                from={colorClass === "text-brand-danger" ? parseFloat(numericValue) * 1.3 : 0}
                to={parseFloat(numericValue)}
                separator=","
                duration={0.5}
                direction={colorClass === "text-brand-danger" ? "down" : "up"}
                className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-brand-text neon-text-glow"
              />
            </span>
          ) : (
            value
          )}
        </h3>
        {subtext && (
          <p className="text-[10px] sm:text-xs text-brand-text/40 font-mono truncate">{subtext}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
