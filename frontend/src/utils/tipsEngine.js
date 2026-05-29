// AI-Style Tips and Financial Insight Engine for Expense Tracker

// Helper to get formatted dates
const getLocalDateString = (dateObj) => {
  return dateObj.toISOString().split("T")[0];
};

export const generatePersonalizedTips = (transactions) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Filter current month transactions
  const thisMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() === month;
  });

  const thisMonthExpenses = thisMonthTransactions.filter((t) => t.type === "expense");
  const thisMonthSavings = thisMonthTransactions.filter((t) => t.type === "saving");

  const totalExpenses = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = thisMonthSavings.reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalExpenses + totalSavings; // Approx monthly budget allocation

  // --- 1. WHERE YOU'RE LAGGING PANEL ---
  const laggingCards = [];

  // Check 1: Weekend Spending
  // Calculate average daily spend on weekdays vs weekends
  let weekdaySpend = 0, weekdayCount = 0;
  let weekendSpend = 0, weekendCount = 0;

  thisMonthExpenses.forEach((t) => {
    const day = new Date(t.date).getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
    } else {
      weekdaySpend += t.amount;
    }
  });

  // Unique days in this month
  const uniqueDays = [...new Set(thisMonthExpenses.map((t) => t.date))];
  uniqueDays.forEach((dateStr) => {
    const day = new Date(dateStr).getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  });

  const avgWeekday = weekdayCount > 0 ? weekdaySpend / weekdayCount : 0;
  const avgWeekend = weekendCount > 0 ? weekendSpend / weekendCount : 0;

  if (avgWeekend > avgWeekday * 1.3 && avgWeekend > 0) {
    const ratio = ((avgWeekend - avgWeekday) / avgWeekday * 100).toFixed(0);
    laggingCards.push({
      id: "weekend_spike",
      type: "warning",
      title: "Weekend Spending Spike",
      message: `Your average weekend daily spend is ${ratio}% higher than weekdays (₹${avgWeekend.toFixed(0)} vs ₹${avgWeekday.toFixed(0)}). Consider setting a dedicated weekend budget.`,
    });
  }

  // Check 2: High Food Spend
  const foodSpend = thisMonthExpenses
    .filter((t) => t.category === "Food")
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses > 0 && foodSpend / totalExpenses > 0.35) {
    const foodPercent = ((foodSpend / totalExpenses) * 100).toFixed(0);
    laggingCards.push({
      id: "high_food",
      type: "alert",
      title: "Excessive Food Spending",
      message: `Food accounts for ${foodPercent}% of your total expenses this month (₹${foodSpend.toFixed(0)}). Cooking at home more often could save you a significant amount.`,
    });
  }

  // Check 3: No Savings this week
  // Get start of this week (Monday)
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const startOfThisWeek = getStartOfWeek(today);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const thisWeeksSavingsCount = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= startOfThisWeek && t.type === "saving";
  }).length;

  if (thisWeeksSavingsCount === 0 && transactions.length > 0) {
    laggingCards.push({
      id: "no_savings_week",
      type: "critical",
      title: "No Weekly Savings Recorded",
      message: "You haven't set aside any savings yet this week! Try saving even ₹100 today to keep your habit active.",
    });
  }

  // Check 4: Recharge or Subscription leaks
  const entertainmentSpend = thisMonthExpenses
    .filter((t) => t.category === "Entertainment")
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses > 0 && entertainmentSpend > 3000) {
    laggingCards.push({
      id: "entertainment_leak",
      type: "warning",
      title: "Subscription & Entertainment Leak",
      message: `You spent ₹${entertainmentSpend.toFixed(0)} on entertainment & subscriptions this month. Review your active plans for any you no longer use.`,
    });
  }

  // If no lagging issues found, add a placeholder success card
  if (laggingCards.length === 0) {
    laggingCards.push({
      id: "all_good",
      type: "success",
      title: "Financial Discipline Maintained",
      message: "No negative spending patterns detected this month! Keep up the excellent work.",
    });
  }

  // --- 2. HOW TO IMPROVE SAVINGS PANEL ---
  const improvementTips = [];

  // Tip 1: Food saving calculation
  if (foodSpend > 1000) {
    const potentialSaving = foodSpend * 0.4; // assume saving 40%
    improvementTips.push({
      id: "food_tip",
      title: "Meal Prep & Kitchen savings",
      message: `You spent ₹${foodSpend.toFixed(0)} on Food this month. Consider cooking at home 3x more a week, which could save you around ₹${potentialSaving.toFixed(0)}!`,
    });
  }

  // Tip 2: Shopping cooldown
  const shoppingSpend = thisMonthExpenses
    .filter((t) => t.category === "Shopping")
    .reduce((sum, t) => sum + t.amount, 0);

  if (shoppingSpend > 2000) {
    const potentialSaving = shoppingSpend * 0.3; // assume saving 30% by using 48-hour rule
    improvementTips.push({
      id: "shopping_tip",
      title: "Apply the 48-Hour Cooldown",
      message: `You spent ₹${shoppingSpend.toFixed(0)} on Shopping. For non-essential items, wait 48 hours before buying. This cooldown eliminates impulse purchases, saving you ~₹${potentialSaving.toFixed(0)}.`,
    });
  }

  // Tip 3: Transport optimization
  const transportSpend = thisMonthExpenses
    .filter((t) => t.category === "Transport")
    .reduce((sum, t) => sum + t.amount, 0);

  if (transportSpend > 1500) {
    improvementTips.push({
      id: "transport_tip",
      title: "Carpooling and Public Transit",
      message: `With ₹${transportSpend.toFixed(0)} spent on commuting/rides, using public transit or carpooling twice a week could reduce transit costs by up to 25%.`,
    });
  }

  // Tip 4: Micro-Savings rule
  improvementTips.push({
    id: "micro_savings_tip",
    title: "Enable Micro-Savings",
    message: "Whenever you make an expense, transfer an additional 10% of that value to Savings. It builds up a massive cushion effortlessly over time.",
  });

  // --- 3. YOUR MONEY HABITS METRICS ---
  // Average daily spend: expenses this month / days elapsed this month
  const currentDayOfMonth = today.getDate();
  const averageDailySpend = totalExpenses > 0 ? totalExpenses / currentDayOfMonth : 0;

  // Most used payment method
  const paymentModeCounts = {};
  thisMonthExpenses.forEach((t) => {
    paymentModeCounts[t.paymentMode] = (paymentModeCounts[t.paymentMode] || 0) + 1;
  });
  let mostUsedPaymentMode = "None";
  let maxCount = 0;
  Object.keys(paymentModeCounts).forEach((pm) => {
    if (paymentModeCounts[pm] > maxCount) {
      maxCount = paymentModeCounts[pm];
      mostUsedPaymentMode = pm;
    }
  });

  // Biggest expense category
  const categoryExpenses = {};
  thisMonthExpenses.forEach((t) => {
    categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
  });
  let biggestCategory = "None";
  let maxCatAmount = 0;
  Object.keys(categoryExpenses).forEach((cat) => {
    if (categoryExpenses[cat] > maxCatAmount) {
      maxCatAmount = categoryExpenses[cat];
      biggestCategory = cat;
    }
  });

  // Streak of discipline (consecutive days in current month with zero transactions)
  // Let's calculate: Days in the current month with no transactions, and the current streak.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let daysWithNoTransactions = 0;
  
  // Set of dates with transactions
  const txDatesThisMonth = new Set(
    thisMonthTransactions.map((t) => t.date)
  );

  for (let d = 1; d <= currentDayOfMonth; d++) {
    const dayStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    if (!txDatesThisMonth.has(dayStr)) {
      daysWithNoTransactions++;
    }
  }

  // Calculate current streak of no transactions (consecutive days ending today or recently)
  let currentStreak = 0;
  let checkingDay = new Date(today);
  
  while (true) {
    const dateStr = getLocalDateString(checkingDay);
    if (!txDatesThisMonth.has(dateStr)) {
      currentStreak++;
      checkingDay.setDate(checkingDay.getDate() - 1);
    } else {
      break;
    }
    // Limit to safety
    if (currentStreak > 365) break;
  }

  const moneyHabits = {
    averageDailySpend: parseFloat(averageDailySpend.toFixed(2)),
    mostUsedPaymentMode,
    biggestCategory,
    daysWithNoTransactions,
    currentStreak,
  };

  // --- 4. 50-30-20 BUDGET RULE TRACKER ---
  // Mapping:
  // Needs: Transport, Health, Recharge (Fixed/essential costs)
  // Wants: Food, Shopping, Entertainment, Other (Discretionary)
  // Savings: all transactions of type: "saving" or category "Savings"
  
  let needsAmount = 0;
  let wantsAmount = 0;
  let savingsAmount = 0;

  thisMonthTransactions.forEach((t) => {
    if (t.type === "saving" || t.category === "Savings") {
      savingsAmount += t.amount;
    } else if (["Transport", "Health", "Recharge"].includes(t.category)) {
      needsAmount += t.amount;
    } else {
      // Food, Shopping, Entertainment, Other
      wantsAmount += t.amount;
    }
  });

  const totalBudgeted = needsAmount + wantsAmount + savingsAmount;
  const needsPercent = totalBudgeted > 0 ? (needsAmount / totalBudgeted) * 100 : 0;
  const wantsPercent = totalBudgeted > 0 ? (wantsAmount / totalBudgeted) * 100 : 0;
  const savingsPercent = totalBudgeted > 0 ? (savingsAmount / totalBudgeted) * 100 : 0;

  const budgetRule = {
    totalBudgeted: parseFloat(totalBudgeted.toFixed(2)),
    needs: { amount: needsAmount, percent: parseFloat(needsPercent.toFixed(1)), ideal: 50 },
    wants: { amount: wantsAmount, percent: parseFloat(wantsPercent.toFixed(1)), ideal: 30 },
    savings: { amount: savingsAmount, percent: parseFloat(savingsPercent.toFixed(1)), ideal: 20 },
    status: "",
  };

  // Evaluate status
  if (savingsPercent >= 20 && wantsPercent <= 30 && needsPercent <= 50) {
    budgetRule.status = "🎯 Perfect! You are following the 50-30-20 rule perfectly.";
  } else if (savingsPercent < 15) {
    budgetRule.status = "⚠️ Warning: Your savings are below the recommended 20% mark. Try to cut back on 'Wants' to allocate more to 'Savings'.";
  } else if (wantsPercent > 40) {
    budgetRule.status = "🍔 Notice: Your 'Wants' spending is quite high (>40%). Review your entertainment and shopping logs.";
  } else {
    budgetRule.status = "📈 Keep it up! Aim to allocate 50% for Needs, 30% for Wants, and 20% for Savings.";
  }

  return {
    laggingCards,
    improvementTips,
    moneyHabits,
    budgetRule,
  };
};
