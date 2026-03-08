/**
 * Calculate EMI based on principal and number of installments
 */
const calculateEMI = (principal, installments) => {
  if (installments <= 0) return principal;
  const emi = principal / installments;
  return Math.round(emi * 100) / 100;
};

/**
 * Set a date to a specific day of month, rolling to next month if out of range
 */
const setDayOfMonth = (date, day) => {
  const d = new Date(date);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, maxDay));
  return d;
};

/**
 * Generate full amortization schedule based on frequency.
 * cycleDay:
 *   - Weekly: name of weekday e.g. 'Monday'
 *   - 15 Days: numeric day of month for first collection (1-28); second is cycleDay+15
 *   - Monthly: numeric day of month e.g. 15 means collect on 15th every month
 */
const generateAmortizationSchedule = (principal, tenureMonths, startDate, frequency, totalInterest = 0, manualEmiAmount = null, cycleDay = null, firstDueDate = null) => {
  let installments = 0;
  let intervalDays = 0;
  let intervalMonths = 0;

  switch (frequency) {
    case '15 Days':
      installments = tenureMonths * 2;
      intervalDays = 15;
      break;
    case 'Weekly':
      installments = tenureMonths; // tenure represents weeks here
      intervalDays = 7;
      break;
    case 'Monthly':
    default:
      installments = tenureMonths;
      intervalMonths = 1;
      break;
  }

  const totalPayable = principal + Number(totalInterest);
  const emi = manualEmiAmount ? Number(manualEmiAmount) : calculateEMI(totalPayable, installments);
  const schedule = [];
  let balance = principal;
  let interestBalance = Number(totalInterest);

  const interestPerInstallment = Math.round((totalInterest / installments) * 100) / 100;
  const principalPerInstallment = Math.round((principal / installments) * 100) / 100;

  // ---------- First due date logic ----------
  let currentDueDate;
  const cycleDayNum = cycleDay ? parseInt(cycleDay, 10) : null;

  if (firstDueDate) {
    // Manual override: user chose exact first date
    currentDueDate = new Date(firstDueDate);
  } else if (frequency === 'Weekly' && cycleDay && isNaN(cycleDayNum)) {
    // Weekly with named day e.g. 'Monday'
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(cycleDay);
    currentDueDate = new Date(startDate);
    let daysToAdd = (targetDay + 7 - currentDueDate.getDay()) % 7;
    if (daysToAdd === 0) daysToAdd = 7;
    currentDueDate.setDate(currentDueDate.getDate() + daysToAdd);
  } else if ((frequency === 'Monthly' || frequency === '15 Days') && cycleDayNum) {
    // Find the first occurrence of cycleDayNum AFTER startDate
    const start = new Date(startDate);
    let candidate = setDayOfMonth(start, cycleDayNum);
    if (candidate <= start) {
      // Move to next month's same day
      candidate = setDayOfMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1), cycleDayNum);
    }
    currentDueDate = candidate;
  } else {
    // Default: one interval after startDate
    currentDueDate = new Date(startDate);
    if (intervalMonths > 0) {
      currentDueDate.setMonth(currentDueDate.getMonth() + intervalMonths);
    } else {
      currentDueDate.setDate(currentDueDate.getDate() + intervalDays);
    }
  }

  // ---------- Schedule generation ----------
  for (let i = 1; i <= installments; i++) {
    const pPart = i === installments ? balance : principalPerInstallment;
    balance = Math.round((balance - pPart) * 100) / 100;

    const iPart = i === installments ? interestBalance : interestPerInstallment;
    interestBalance = Math.round((interestBalance - iPart) * 100) / 100;

    const currentEMI = Math.round((pPart + iPart) * 100) / 100;
    const dueDate = new Date(currentDueDate);

    schedule.push({
      installmentNo: i,
      dueDate,
      principal: pPart,
      interest: iPart,
      emi: currentEMI,
      balance: Math.max(balance, 0),
      status: 'pending',
      paidAmount: 0,
      penalty: 0,
    });

    // ---------- Advance to next due date ----------
    if (frequency === 'Monthly' && cycleDayNum) {
      // Advance month-by-month, pinning to the same day
      const nextMonth = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 1, 1);
      currentDueDate = setDayOfMonth(nextMonth, cycleDayNum);
    } else if (frequency === '15 Days' && cycleDayNum) {
      // Alternate between cycleDayNum and cycleDayNum+15 within same/next month
      const secondDay = cycleDayNum + 15;
      if (currentDueDate.getDate() === cycleDayNum) {
        // Move to second slot of same month
        const sameMonth = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth(), 1);
        const maxDay = new Date(sameMonth.getFullYear(), sameMonth.getMonth() + 1, 0).getDate();
        currentDueDate = new Date(sameMonth.getFullYear(), sameMonth.getMonth(), Math.min(secondDay, maxDay));
      } else {
        // Move to first slot of next month
        const nextMonth = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 1, 1);
        currentDueDate = setDayOfMonth(nextMonth, cycleDayNum);
      }
    } else if (intervalMonths > 0) {
      currentDueDate.setMonth(currentDueDate.getMonth() + intervalMonths);
    } else {
      currentDueDate.setDate(currentDueDate.getDate() + intervalDays);
    }
  }

  const actualTotal = Math.round((principal + Number(totalInterest)) * 100) / 100;

  return { schedule, emi: Math.round(emi * 100) / 100, totalAmount: actualTotal, totalInterest: Number(totalInterest) };
};

/**
 * Calculate penalty for overdue EMIs
 */
const calculatePenalty = (emiAmount, penaltyRatePerDay, daysOverdue) => {
  return Math.round(emiAmount * (penaltyRatePerDay / 100) * daysOverdue * 100) / 100;
};

module.exports = { calculateEMI, generateAmortizationSchedule, calculatePenalty };
