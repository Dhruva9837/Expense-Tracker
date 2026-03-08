const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Group = require('../models/Group');
const Payment = require('../models/Payment');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');
const { generateAmortizationSchedule } = require('../services/emiService');

// @route GET /api/loans
exports.getLoans = async (req, res, next) => {
  try {
    const { status, groupId, page = 1, limit = 100, search, meetingDay } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (groupId) query.groupId = groupId;

    if (meetingDay) {
      const groups = await Group.find({ meetingDay, isDeleted: false }).select('_id');
      query.groupId = { $in: groups.map(g => g._id) };
    }

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate({
        path: 'groupId',
        select: 'groupName centerNumber centerName village groupHead meetingDay',
        populate: { path: 'groupHead', select: 'name phone aadhaar' }
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-schedule');

    return res.json({
      success: true, data: loans,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @route GET /api/loans/:id
exports.getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, isDeleted: false })
      .populate({
        path: 'groupId',
        select: 'groupName centerNumber centerName village groupHead members',
        populate: [
          { path: 'groupHead', select: 'name phone aadhaar' },
          { path: 'members', select: 'name phone aadhaar' }
        ]
      })
      .populate('activityTimeline.performedBy', 'name');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    return res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// @route POST /api/loans
exports.createLoan = async (req, res, next) => {
  try {
    const { groupId, principal, tenure, purpose, disbursedAt, penaltyRate, manualEmiAmount, emiFrequency, memberIds, totalInterest, cycleDay, firstDueDate, isManualSchedule, schedule: customSchedule } = req.body;

    if (!groupId || !principal || !tenure || !emiFrequency) {
      return res.status(400).json({ success: false, message: 'Missing required fields (groupId, principal, tenure, emiFrequency)' });
    }

    if (Number(principal) <= 0 || Number(tenure) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount and Tenure must be greater than zero.' });
    }

    // Check group exists
    const group = await Group.findOne({ _id: groupId, isDeleted: false });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Group Head validation
    if (!group.groupHead) {
      return res.status(400).json({ success: false, message: 'Group must have a designated head before getting a loan' });
    }

    // Check for active loan on same Group
    const existingActive = await Loan.findOne({ groupId, status: LOAN_STATUS.ACTIVE });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'This group already has an active loan. Close the existing loan before creating a new one.',
      });
    }

    const startDate = disbursedAt ? new Date(disbursedAt) : new Date();

    let finalSchedule = [];
    let finalEmi = 0;
    let finalTotalAmount = 0;

    if (isManualSchedule && customSchedule && Array.isArray(customSchedule)) {
      // Use the provided manual schedule
      finalSchedule = customSchedule.map(item => ({
        installmentNumber: item.installmentNumber,
        dueDate: new Date(item.dueDate),
        amount: Number(item.amount),
        status: EMI_STATUS.PENDING
      }));
      finalEmi = finalSchedule.length > 0 ? finalSchedule[0].amount : 0;
      finalTotalAmount = finalSchedule.reduce((sum, item) => sum + item.amount, 0);
    } else {
      // Default auto-calculation
      const computed = generateAmortizationSchedule(
        Number(principal), Number(tenure), startDate, emiFrequency, totalInterest || 0, manualEmiAmount, cycleDay || null, firstDueDate || null
      );
      finalSchedule = computed.schedule;
      finalEmi = computed.emi;
      finalTotalAmount = computed.totalAmount;
    }

    const maturityDate = new Date(finalSchedule[finalSchedule.length - 1].dueDate);

    const loan = await Loan.create({
      groupId,
      principal: Number(principal),
      emiFrequency,
      tenure: Number(tenure),
      emiAmount: finalEmi,
      purpose,
      disbursedAt: startDate,
      maturityDate,
      status: LOAN_STATUS.ACTIVE,
      outstandingBalance: Number(principal),
      totalAmount: finalTotalAmount,
      totalInterest: Number(totalInterest) || (finalTotalAmount - Number(principal)),
      penaltyRate: penaltyRate || 2,
      schedule: finalSchedule,
      members: memberIds || [],
      createdBy: req.user._id,
      activityTimeline: [{ action: 'LOAN_CREATED', description: `Loan of ₹${principal} created with ${emiFrequency} frequency`, performedBy: req.user._id }],
    });

    return res.status(201).json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// @route GET /api/loans/:id/schedule
exports.getSchedule = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, isDeleted: false }).select('schedule emiAmount');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    return res.json({ success: true, data: loan.schedule });
  } catch (err) { next(err); }
};

// @route PUT /api/loans/:id/status
exports.updateLoanStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedTransitions = {
      pending: ['active', 'closed'],
      active: ['closed', 'defaulted'],
      defaulted: ['active', 'closed'],
    };

    const loan = await Loan.findOne({ _id: req.params.id, isDeleted: false });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const allowed = allowedTransitions[loan.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${loan.status} to ${status}` });
    }

    loan.status = status;
    if (status === 'closed') loan.closedAt = new Date();
    loan.activityTimeline.push({ action: 'STATUS_CHANGE', description: `Status changed to ${status}`, performedBy: req.user._id });
    await loan.save();
    return res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// @route POST /api/loans/:id/prepay
exports.prepayLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, status: LOAN_STATUS.ACTIVE }).session(session);
    if (!loan) { await session.abortTransaction(); return res.status(404).json({ success: false, message: 'Active loan not found' }); }

    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - amount);
    loan.prepaidAmount = (loan.prepaidAmount || 0) + amount;
    loan.activityTimeline.push({ action: 'PREPAYMENT', description: `Prepayment of ₹${amount}`, performedBy: req.user._id });

    if (loan.outstandingBalance === 0) {
      loan.status = LOAN_STATUS.CLOSED;
      loan.closedAt = new Date();
    }
    await loan.save({ session });

    await Payment.create([{ loanId: loan._id, groupId: loan.groupId, amount, notes: 'Prepayment', collectedBy: req.user._id }], { session });

    await session.commitTransaction();
    return res.json({ success: true, data: loan });
  } catch (err) { await session.abortTransaction(); next(err); }
  finally { session.endSession(); }
};
