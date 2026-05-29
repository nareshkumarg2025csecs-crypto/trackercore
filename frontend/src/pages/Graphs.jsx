import React, { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import {
  getWeeklyChartData,
  getMonthlyLineChartData,
  getCategoryBreakdownData,
  getPaymentModeBreakdownData,
  getWeekOverWeekComparison,
  formatCurrency,
} from "../utils/calculations";

const Graphs = ({ transactions }) => {
  // View Toggle: "this_month" | "last_month"
  const [viewMonth, setViewMonth] = useState("this_month");

  // Fetch chart datasets based on selected filters
  const weeklyData = useMemo(() => getWeeklyChartData(transactions), [transactions]);
  
  const monthlyLineData = useMemo(() => {
    return getMonthlyLineChartData(transactions, viewMonth);
  }, [transactions, viewMonth]);

  const categoryPieData = useMemo(() => {
    return getCategoryBreakdownData(transactions, viewMonth);
  }, [transactions, viewMonth]);

  const paymentModeData = useMemo(() => {
    return getPaymentModeBreakdownData(transactions, viewMonth);
  }, [transactions, viewMonth]);

  const wowData = useMemo(() => getWeekOverWeekComparison(transactions), [transactions]);

  // Color palette for the category pie chart
  const PIE_COLORS = [
    "#00e676", // Food (Neon green)
    "#33b5e5", // Transport (Blue)
    "#ffbb33", // Shopping (Amber)
    "#ff4444", // Entertainment (Red)
    "#aa66cc", // Health (Purple)
    "#00c851", // Recharge (Green)
    "#2bbbad", // Savings (Cyan)
    "#ff8800", // Other (Orange)
  ];

  // Dynamic Insight Chips as subtle pills
  const insightChips = useMemo(() => {
    const chips = [];
    if (transactions.length === 0) return chips;

    // Insight 1: Week-over-Week comparative
    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    wowData.forEach((d) => {
      thisWeekTotal += d["This Week"];
      lastWeekTotal += d["Last Week"];
    });

    if (lastWeekTotal > 0) {
      const diff = thisWeekTotal - lastWeekTotal;
      const pct = Math.abs((diff / lastWeekTotal) * 100).toFixed(0);
      if (diff > 0) {
        chips.push({
          id: "wow_increase",
          text: `WoW Change: Up by ${pct}% (₹${thisWeekTotal.toFixed(0)} vs ₹${lastWeekTotal.toFixed(0)})`,
          style: "border-brand-danger/25 text-brand-danger bg-brand-danger/5",
        });
      } else {
        chips.push({
          id: "wow_decrease",
          text: `WoW Change: Down by ${pct}% (₹${thisWeekTotal.toFixed(0)} vs ₹${lastWeekTotal.toFixed(0)})`,
          style: "border-brand-accent/25 text-brand-accent bg-brand-accent/5",
        });
      }
    }

    // Insight 2: Biggest Expense Category
    if (categoryPieData.length > 0) {
      const topCat = [...categoryPieData].sort((a, b) => b.value - a.value)[0];
      chips.push({
        id: "top_category",
        text: `Top Sector: ${topCat.name} at ${topCat.percentage}% (₹${topCat.value.toFixed(0)})`,
        style: "border-[rgba(255,255,255,0.06)] text-brand-text bg-brand-card",
      });
    }

    // Insight 3: Preferred Gateway
    if (paymentModeData.length > 0) {
      const activeModes = paymentModeData.filter((d) => d.amount > 0);
      if (activeModes.length > 0) {
        const topMode = [...activeModes].sort((a, b) => b.amount - a.amount)[0];
        chips.push({
          id: "top_payment",
          text: `Top Gateway: ${topMode.name} (₹${topMode.amount.toFixed(0)})`,
          style: "border-[rgba(255,255,255,0.06)] text-brand-text bg-brand-card",
        });
      }
    }

    return chips;
  }, [wowData, categoryPieData, paymentModeData, transactions]);

  // Reusable custom chart tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-card border border-[rgba(255,255,255,0.06)] p-3 rounded-xl text-[10px] font-mono">
          <p className="text-brand-text/40 mb-1">Index: {label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || "#00e676" }} className="font-bold">
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasExpenses = transactions.filter((t) => t.type === "expense").length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12 text-left">
      {/* 1. Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-brand-text font-heading uppercase">
            Spending Analytics
          </h1>
          <p className="text-[10px] md:text-xs text-brand-text/50 font-mono">
            Analytical chart modules and gateway balances visualizations
          </p>
        </div>

        {/* View Switches */}
        <div className="flex w-full md:w-auto rounded-xl bg-brand-card p-1 border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setViewMonth("this_month")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
              viewMonth === "this_month"
                ? "bg-brand-accent text-brand-bg shadow-lg shadow-brand-accent/20"
                : "text-brand-text/50 hover:text-brand-text"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setViewMonth("last_month")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
              viewMonth === "last_month"
                ? "bg-brand-accent text-brand-bg shadow-lg shadow-brand-accent/20"
                : "text-brand-text/50 hover:text-brand-text"
            }`}
          >
            Last Month
          </button>
        </div>
      </div>

      {!hasExpenses ? (
        <div className="glass-panel p-10 md:p-16 rounded-2xl md:rounded-3xl text-center max-w-xl mx-auto space-y-4">
          <BarChart3 className="h-8 md:h-10 w-8 md:w-10 text-brand-accent/20 mx-auto" />
          <h3 className="text-sm md:text-base font-bold font-heading text-brand-text uppercase">
            No Plotting Data Available
          </h3>
          <p className="text-[10px] md:text-xs font-mono text-brand-text/50 leading-relaxed">
            Record expense or saving items in the Tracker terminal to draw the visualizer charts.
          </p>
        </div>
      ) : (
        <>
          {/* 2. TOP DYNAMIC INSIGHT CHIPS (Small subtle pills) */}
          {insightChips.length > 0 && (
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
              {insightChips.map((chip) => (
                <div
                  key={chip.id}
                  className={`px-3 py-1.5 rounded-lg md:rounded-full border text-[9px] md:text-[10px] font-mono tracking-wide flex items-center justify-center text-center ${chip.style}`}
                >
                  {chip.text}
                </div>
              ))}
            </div>
          )}

          {/* 3. CHARTS GRID (Clean two-column spacious grids) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            
            {/* Weekly Spending Bar Chart */}
            <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[300px] md:min-h-[350px]">
              <div className="mb-6">
                <h3 className="text-[9px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                  Last 7 Days Outflows
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <YAxis
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0, 230, 118, 0.02)" }} />
                    <Bar dataKey="amount" fill="#ff4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Week-over-Week Comparison */}
            <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[300px] md:min-h-[350px]">
              <div className="mb-6">
                <h3 className="text-[9px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                  Weekly Outflow Comparison
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <YAxis
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0, 230, 118, 0.02)" }} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: 8, fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.4)" }}
                    />
                    <Bar dataKey="This Week" fill="#ff4444" radius={[3, 3, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="Last Week" fill="rgba(255, 68, 68, 0.2)" radius={[3, 3, 0, 0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Line Chart (Expenses vs Savings) */}
            <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[300px] md:min-h-[350px]">
              <div className="mb-6">
                <h3 className="text-[9px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                  Daily Flow Timelines
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyLineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <YAxis
                      stroke="rgba(224, 255, 232, 0.15)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Expenses"
                      name="Withdrawals"
                      stroke="#ff4444"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Savings"
                      name="Deposits"
                      stroke="#00e676"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie / Donut Chart */}
            <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[300px] md:min-h-[350px]">
              <div className="mb-6">
                <h3 className="text-[9px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                  Outflows by Sector
                </h3>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 min-h-[250px]">
                {categoryPieData.length === 0 ? (
                  <div className="text-[10px] font-mono text-brand-text/30">No recorded outflows</div>
                ) : (
                  <>
                    <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center value */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[7px] font-bold text-brand-text/30 uppercase tracking-widest font-heading">
                          Total
                        </span>
                        <span className="text-[10px] md:text-xs font-bold font-mono text-brand-text">
                          {formatCurrency(categoryPieData.reduce((sum, item) => sum + item.value, 0))}
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex-1 w-full max-h-[160px] overflow-y-auto pr-2 grid grid-cols-1 gap-2 text-[10px] font-mono">
                      {categoryPieData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between py-1 border-b border-[rgba(255,255,255,0.02)]">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            ></span>
                            <span className="text-brand-text/60 truncate">{item.name}</span>
                          </div>
                          <span className="text-brand-accent font-bold">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Mode Bar Chart */}
            <div className="glass-panel rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[rgba(255,255,255,0.06)] flex flex-col min-h-[300px] md:min-h-[350px]">
              <div className="mb-6">
                <h3 className="text-[9px] md:text-xs font-bold text-brand-text/40 uppercase tracking-widest font-heading">
                  Volume by Gateway
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                {paymentModeData.filter((d) => d.amount > 0).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] font-mono text-brand-text/30">
                    No payment gateway transactions
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentModeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(224, 255, 232, 0.15)"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                      />
                      <YAxis
                        stroke="rgba(224, 255, 232, 0.15)"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.01)" }} />
                      <Bar dataKey="amount" fill="#00e676" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        {paymentModeData.map((entry, index) => {
                          let barColor = "rgba(0, 230, 118, 0.6)";
                          if (entry.name === "FamPay") barColor = "#ffbb33";
                          else if (entry.name === "Cash") barColor = "#33b5e5";
                          else if (entry.name === "Other") barColor = "#ff8800";
                          return <Cell key={`cell-${index}`} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Graphs;
