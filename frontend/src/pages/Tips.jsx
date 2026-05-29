import React, { useMemo } from "react";
import { generatePersonalizedTips } from "../utils/tipsEngine";
import { formatCurrency } from "../utils/calculations";

const Tips = ({ transactions }) => {
  // Fetch engine analytical output
  const insights = useMemo(() => {
    return generatePersonalizedTips(transactions);
  }, [transactions]);

  const { laggingCards, improvementTips, moneyHabits } = insights;

  const hasTransactions = transactions.length > 0;

  // Calculate overall savings rate percentage from real data
  const savingsRate = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.type === "saving").reduce((sum, t) => sum + t.amount, 0);
    const total = expenses + savings;
    return total > 0 ? ((savings / total) * 100).toFixed(1) : "0.0";
  }, [transactions]);

  // Restrict to exactly 2-3 spending observations
  const finalObservations = useMemo(() => {
    return laggingCards.slice(0, 3);
  }, [laggingCards]);

  // Restrict to exactly 3 actionable tips
  const finalTips = useMemo(() => {
    return improvementTips.slice(0, 3);
  }, [improvementTips]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-1 text-left">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-brand-text font-heading uppercase">
            Financial Intelligence
          </h1>
          <p className="text-[10px] md:text-xs text-brand-text/50 font-mono">
            Category leakage analysis and personalized savings plans
          </p>
        </div>
      </div>

      {!hasTransactions ? (
        <div className="glass-panel p-10 md:p-16 rounded-2xl md:rounded-3xl text-center max-w-xl mx-auto space-y-4">
          <h3 className="text-sm md:text-base font-bold font-heading text-brand-text uppercase">
            Awaiting Transaction Logs
          </h3>
          <p className="text-[10px] md:text-xs font-mono text-brand-text/50 leading-relaxed text-center">
            Record a deposit or withdrawal entry in the Tracker page to compile financial intelligence reports.
          </p>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12">
          
          {/* Section 1: Spending Patterns */}
          <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[rgba(255,255,255,0.06)] space-y-6">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                Spending Patterns
              </h2>
              <p className="text-[10px] md:text-[11px] text-brand-text/30 font-mono mt-1">
                Algorithmic observations based on daily transaction history
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {finalObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-2 hover:border-brand-danger/20 transition-colors"
                >
                  <div className="text-[9px] md:text-[10px] font-bold text-brand-danger uppercase tracking-wider font-heading">
                    {obs.title}
                  </div>
                  <p className="text-[11px] md:text-xs font-mono text-brand-text/70 leading-relaxed">
                    {obs.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Smart Saving Tips */}
          <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[rgba(255,255,255,0.06)] space-y-6">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                Smart Saving Tips
              </h2>
              <p className="text-[10px] md:text-[11px] text-brand-text/30 font-mono mt-1">
                Actionable changes to optimize monthly capital reserves
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {finalTips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-2 hover:border-brand-accent/20 transition-colors"
                >
                  <div className="text-[9px] md:text-[10px] font-bold text-brand-accent uppercase tracking-wider font-heading">
                    {tip.title}
                  </div>
                  <p className="text-[11px] md:text-xs font-mono text-brand-text/70 leading-relaxed">
                    {tip.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Money Habits */}
          <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[rgba(255,255,255,0.06)] space-y-6">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                Money Habits
              </h2>
              <p className="text-[10px] md:text-[11px] text-brand-text/30 font-mono mt-1">
                Key performance stat metrics of the current cycle
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              
              {/* Average Daily Spend */}
              <div className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-1">
                <div className="text-[8px] md:text-[9px] font-bold text-brand-text/30 uppercase tracking-wider font-heading">
                  Avg Daily Spend
                </div>
                <div className="text-base md:text-lg font-bold font-mono text-brand-text">
                  {formatCurrency(moneyHabits.averageDailySpend)}
                </div>
              </div>

              {/* Peak Sector */}
              <div className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-1">
                <div className="text-[8px] md:text-[9px] font-bold text-brand-text/30 uppercase tracking-wider font-heading">
                  Top Category
                </div>
                <div className="text-base md:text-lg font-bold font-mono text-brand-text truncate">
                  {moneyHabits.biggestCategory !== "None" ? moneyHabits.biggestCategory : "None"}
                </div>
              </div>

              {/* Savings Rate */}
              <div className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-1">
                <div className="text-[8px] md:text-[9px] font-bold text-brand-text/30 uppercase tracking-wider font-heading">
                  Savings Rate
                </div>
                <div className="text-base md:text-lg font-bold font-mono text-brand-accent">
                  {savingsRate}%
                </div>
              </div>

              {/* Preferred Gateway */}
              <div className="p-5 md:p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-1">
                <div className="text-[9px] font-bold text-brand-text/30 uppercase tracking-wider font-heading">
                  Top Payment Mode
                </div>
                <div className="text-lg font-bold font-mono text-brand-text">
                  {moneyHabits.mostUsedPaymentMode !== "None" ? moneyHabits.mostUsedPaymentMode : "None"}
                </div>
              </div>

              {/* Savings Rate Percentage */}
              <div className="p-6 bg-brand-bg/40 border border-[rgba(255,255,255,0.04)] rounded-2xl space-y-1">
                <div className="text-[9px] font-bold text-brand-text/30 uppercase tracking-wider font-heading">
                  Savings Rate
                </div>
                <div className="text-lg font-bold font-mono text-brand-accent">
                  {savingsRate}%
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Tips;
