// Financial Calculation Helpers for GreenLedger

// Helper: Get today's date string in Asia/Kolkata IST (YYYY-MM-DD)
export const getTodayISTDateString = () => {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(now);
  } catch (e) {
    // Fallback UTC+5:30 offset
    const offsetNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return offsetNow.toISOString().split("T")[0];
  }
};

// 1. Today's Withdrawn (Expenses)
export const getTodayExpensesTotal = (transactions) => {
  const todayStr = getTodayISTDateString();
  return transactions
    .filter((t) => t.date === todayStr && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
};

// Helper: get the start of the week in Asia/Kolkata (Monday)
const getStartOfWeekIST = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// 2. This Week's Withdrawn (Monday - Sunday)
export const getThisWeekExpensesTotal = (transactions) => {
  const today = new Date();
  const startOfWeek = getStartOfWeekIST(today);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return transactions
    .filter((t) => {
      const tParts = t.date.split("-").map(Number);
      const tDate = new Date(tParts[0], tParts[1] - 1, tParts[2], 12, 0, 0);
      return tDate >= startOfWeek && tDate <= endOfWeek && t.type === "expense";
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

// 3. This Month's Withdrawn
export const getThisMonthExpensesTotal = (transactions) => {
  const today = new Date();
  // Get current year/month in Asia/Kolkata
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  
  const currentYear = parseInt(formatterYear.format(today), 10);
  const currentMonth = parseInt(formatterMonth.format(today), 10) - 1; // 0-indexed

  return transactions
    .filter((t) => {
      const tParts = t.date.split("-").map(Number);
      return (
        tParts[0] === currentYear &&
        (tParts[1] - 1) === currentMonth &&
        t.type === "expense"
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

// 4. This Month's Deposited (Savings)
export const getThisMonthSavingsTotal = (transactions) => {
  const today = new Date();
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  
  const currentYear = parseInt(formatterYear.format(today), 10);
  const currentMonth = parseInt(formatterMonth.format(today), 10) - 1; // 0-indexed

  return transactions
    .filter((t) => {
      const tParts = t.date.split("-").map(Number);
      return (
        tParts[0] === currentYear &&
        (tParts[1] - 1) === currentMonth &&
        t.type === "saving"
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

// 5. Live Bank Balance
export const getLiveBankBalance = (transactions, startingBalance) => {
  const totalDeposited = transactions
    .filter((t) => t.type === "saving")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return startingBalance + totalDeposited - totalWithdrawn;
};

// 6. Chronological Running Balances
export const computeRunningBalances = (transactions, startingBalance) => {
  const transactionsWithIndices = transactions.map((t, idx) => ({ ...t, originalIndex: idx }));

  const sorted = [...transactionsWithIndices].sort((a, b) => {
    const dateA = a.date.split("-").map(Number);
    const dateB = b.date.split("-").map(Number);
    const valA = new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime();
    const valB = new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime();
    if (valA !== valB) return valA - valB;
    return a.originalIndex - b.originalIndex;
  });

  let currentBalance = startingBalance;
  const balances = {};
  sorted.forEach((t) => {
    if (t.type === "saving") {
      currentBalance += t.amount;
    } else {
      currentBalance -= t.amount;
    }
    balances[t.id] = currentBalance;
  });
  return balances;
};

// 7. Chart Data: Weekly Bar Chart
export const getWeeklyChartData = (transactions) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    // Shift days
    d.setDate(d.getDate() - i);
    // Format to local date parts in IST
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dateStr = formatter.format(d);
    const dayLabel = days[d.getDay()];

    const amount = transactions
      .filter((t) => t.date === dateStr && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      date: dateStr,
      day: dayLabel,
      amount: parseFloat(amount.toFixed(2)),
    });
  }

  return result;
};

// 8. Chart Data: Monthly Line Chart
export const getMonthlyLineChartData = (transactions, viewType = "this_month") => {
  const today = new Date();
  
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  
  let targetYear = parseInt(formatterYear.format(today), 10);
  let targetMonth = parseInt(formatterMonth.format(today), 10) - 1;

  if (viewType === "last_month") {
    if (targetMonth === 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else {
      targetMonth -= 1;
    }
  }

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const monthStr = (targetMonth + 1).toString().padStart(2, "0");
    const dateStr = `${targetYear}-${monthStr}-${dayStr}`;

    const expenses = transactions
      .filter((t) => t.date === dateStr && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = transactions
      .filter((t) => t.date === dateStr && t.type === "saving")
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      day: day,
      date: dateStr,
      Expenses: parseFloat(expenses.toFixed(2)),
      Savings: parseFloat(savings.toFixed(2)),
    });
  }

  return result;
};

// 9. Chart Data: Category Breakdown
export const getCategoryBreakdownData = (transactions, viewType = "this_month") => {
  const today = new Date();
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  
  let targetYear = parseInt(formatterYear.format(today), 10);
  let targetMonth = parseInt(formatterMonth.format(today), 10) - 1;

  if (viewType === "last_month") {
    if (targetMonth === 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else {
      targetMonth -= 1;
    }
  }

  const monthExpenses = transactions.filter((t) => {
    const tParts = t.date.split("-").map(Number);
    return (
      tParts[0] === targetYear &&
      (tParts[1] - 1) === targetMonth &&
      t.type === "expense"
    );
  });

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const categories = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Recharge", "Savings", "Other"];
  
  const categorySums = {};
  categories.forEach((cat) => {
    categorySums[cat] = 0;
  });

  monthExpenses.forEach((t) => {
    if (categorySums[t.category] !== undefined) {
      categorySums[t.category] += t.amount;
    } else {
      categorySums["Other"] = (categorySums["Other"] || 0) + t.amount;
    }
  });

  return Object.keys(categorySums)
    .map((name) => {
      const value = categorySums[name];
      const percentage = totalSpent > 0 ? (value / totalSpent) * 100 : 0;
      return {
        name,
        value: parseFloat(value.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
      };
    })
    .filter((c) => c.value > 0);
};

// 10. Chart Data: Payment Mode Breakdown
export const getPaymentModeBreakdownData = (transactions, viewType = "this_month") => {
  const today = new Date();
  const formatterYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" });
  
  let targetYear = parseInt(formatterYear.format(today), 10);
  let targetMonth = parseInt(formatterMonth.format(today), 10) - 1;

  if (viewType === "last_month") {
    if (targetMonth === 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else {
      targetMonth -= 1;
    }
  }

  const monthExpenses = transactions.filter((t) => {
    const tParts = t.date.split("-").map(Number);
    return (
      tParts[0] === targetYear &&
      (tParts[1] - 1) === targetMonth &&
      t.type === "expense"
    );
  });

  const paymentModes = ["GPay", "FamPay", "Cash", "Other"];
  const sums = {};
  paymentModes.forEach((pm) => {
    sums[pm] = 0;
  });

  monthExpenses.forEach((t) => {
    if (sums[t.paymentMode] !== undefined) {
      sums[t.paymentMode] += t.amount;
    } else {
      sums["Other"] = (sums["Other"] || 0) + t.amount;
    }
  });

  return Object.keys(sums).map((name) => ({
    name,
    amount: parseFloat(sums[name].toFixed(2)),
  }));
};

// 11. Week-over-Week
export const getWeekOverWeekComparison = (transactions) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const thisWeekStart = getStartOfWeekIST(today);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const result = days.map((dayLabel, index) => {
    const thisWeekDate = new Date(thisWeekStart);
    thisWeekDate.setDate(thisWeekStart.getDate() + index);
    
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const thisWeekStr = formatter.format(thisWeekDate);

    const lastWeekDate = new Date(lastWeekStart);
    lastWeekDate.setDate(lastWeekStart.getDate() + index);
    const lastWeekStr = formatter.format(lastWeekDate);

    const thisWeekAmount = transactions
      .filter((t) => t.date === thisWeekStr && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const lastWeekAmount = transactions
      .filter((t) => t.date === lastWeekStr && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      day: dayLabel,
      "This Week": parseFloat(thisWeekAmount.toFixed(2)),
      "Last Week": parseFloat(lastWeekAmount.toFixed(2)),
    };
  });

  return result;
};

// Helper: Format currency
export const formatCurrency = (amount) => {
  return "₹" + parseFloat(amount).toFixed(2);
};

// Helper: Format date to "DD MMM YYYY" under Asia/Kolkata IST
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(Date.UTC(year, monthIdx, day, 12, 0, 0));
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatter.format(date);
  } catch (e) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[monthIdx]} ${year}`;
  }
};
