const Loan = require('../models/Loan');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');
const { calculatePenalty } = require('./emiService');

/**
 * Detect overdue EMIs and update statuses
 * Run daily via cron
 */
const detectOverdue = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeLoans = await Loan.find({ status: LOAN_STATUS.ACTIVE, isDeleted: false });
  let updatedCount = 0;

  for (const loan of activeLoans) {
    let modified = false;

    for (const emi of loan.schedule) {
      if (emi.status === EMI_STATUS.PENDING && new Date(emi.dueDate) < today) {
        emi.status = EMI_STATUS.OVERDUE;

        // Calculate days overdue
        const daysOverdue = Math.floor((today - new Date(emi.dueDate)) / (1000 * 60 * 60 * 24));
        emi.penalty = calculatePenalty(emi.emi, loan.penaltyRate || 2, daysOverdue);
        modified = true;
      }
    }

    if (modified) {
      // Check if loan should be defaulted (>90 days overdue on earliest EMI)
      const oldestOverdue = loan.schedule.find((e) => e.status === EMI_STATUS.OVERDUE);
      if (oldestOverdue) {
        const daysOverdue = Math.floor(
          (today - new Date(oldestOverdue.dueDate)) / (1000 * 60 * 60 * 24)
        );
        if (daysOverdue > 90) {
          loan.status = LOAN_STATUS.DEFAULTED;
        }
      }

      await loan.save();
      updatedCount++;
    }
  }

  console.log(`[Overdue Job] Updated ${updatedCount} loans`);
  return updatedCount;
};

module.exports = { detectOverdue };
