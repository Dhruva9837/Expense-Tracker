const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');
const { delCache } = require('../services/redisService');

// @route POST /api/payments
exports.createPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { loanId, amount, paymentMethod, transactionRef, notes, paymentDate } = req.body;

    const loan = await Loan.findOne({ _id: loanId, status: LOAN_STATUS.ACTIVE, isDeleted: false }).session(session);
    if (!loan) { await session.abortTransaction(); return res.status(404).json({ success: false, message: 'Active loan not found' }); }

    let remaining = Number(amount);
    let installmentNo = null;

    const actualPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

    // Apply payment to EMIs in order (oldest first)
    // NOTE: The EMI structure in the DB is an array of objects. We match based on 'amount' or 'emiAmount' conceptually.
    for (const emi of loan.schedule) {
      if (remaining <= 0) break;
      if ([EMI_STATUS.PENDING, EMI_STATUS.OVERDUE, EMI_STATUS.PARTIAL].includes(emi.status)) {
        // Handle both 'emi' (auto generated) and 'amount' (manual schedule) properties
        const expectedEmiAmount = emi.emi || emi.amount;
        const due = expectedEmiAmount - (emi.paidAmount || 0) + (emi.penalty || 0);

        if (remaining >= due) {
          emi.paidAmount = expectedEmiAmount;
          emi.status = EMI_STATUS.PAID;
          emi.paidAt = actualPaymentDate;
          remaining -= due;
          installmentNo = emi.installmentNo || emi.installmentNumber;
        } else {
          emi.paidAmount = (emi.paidAmount || 0) + remaining;
          emi.status = EMI_STATUS.PARTIAL;
          installmentNo = emi.installmentNo || emi.installmentNumber;
          remaining = 0;
        }
      }
    }

    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - Number(amount));
    loan.activityTimeline.push({
      action: 'PAYMENT_RECEIVED', description: `Payment of ₹${amount} received`, performedBy: req.user._id,
    });

    // Auto-close if balance is 0
    if (loan.outstandingBalance === 0) {
      loan.status = LOAN_STATUS.CLOSED;
      loan.closedAt = actualPaymentDate;
      loan.schedule.forEach((e) => { if (e.status !== EMI_STATUS.PAID) e.status = EMI_STATUS.PAID; });
    }

    await loan.save({ session });

    const payment = await Payment.create([{
      loanId, groupId: loan.groupId, amount: Number(amount),
      paymentMethod, transactionRef, notes,
      installmentNo, collectedBy: req.user._id, paidAt: actualPaymentDate,
    }], { session });

    await session.commitTransaction();
    // Bust dashboard cache so Today's Collection updates immediately
    await delCache('dashboard:kpi');
    return res.status(201).json({ success: true, data: payment[0] });
  } catch (err) { await session.abortTransaction(); next(err); }
  finally { session.endSession(); }
};

// @route GET /api/payments
exports.getPayments = async (req, res, next) => {
  try {
    const { loanId, groupId, page = 1, limit = 20, from, to } = req.query;
    const query = {};
    if (loanId) query.loanId = loanId;
    if (groupId) query.groupId = groupId;
    if (from || to) {
      query.paidAt = {};
      if (from) query.paidAt.$gte = new Date(from);
      if (to) { const end = new Date(to); end.setHours(23, 59, 59); query.paidAt.$lte = end; }
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('loanId', 'loanNumber')
      .populate('groupId', 'groupName center village')
      .populate('collectedBy', 'name')
      .sort({ paidAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true, data: payments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};
