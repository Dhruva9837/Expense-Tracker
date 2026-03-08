const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');

const { getCache, setCache } = require('../services/redisService');
const logger = require('../utils/logger');

// @route GET /api/dashboard/kpi
exports.getDashboardKPI = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard:kpi';
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      logger.info('Cache hit for dashboard:kpi');
      return res.json({ success: true, data: cachedData });
    }

    logger.info('Cache miss for dashboard:kpi. Fetching from DB...');
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalClients,
      activeLoans,
      closedLoans,
      defaultedLoans,
      pendingLoans,
      totalDisbursed,
      todayCollection,
      monthCollection,
      overdueCount,
      outstandingResult,
    ] = await Promise.all([
      Client.countDocuments({ isDeleted: false }),
      Loan.countDocuments({ status: LOAN_STATUS.ACTIVE, isDeleted: false }),
      Loan.countDocuments({ status: LOAN_STATUS.CLOSED, isDeleted: false }),
      Loan.countDocuments({ status: LOAN_STATUS.DEFAULTED, isDeleted: false }),
      Loan.countDocuments({ status: LOAN_STATUS.PENDING, isDeleted: false }),
      Loan.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: null, total: { $sum: '$principal' } } }]),
      Payment.aggregate([{ $match: { paidAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { paidAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Loan.aggregate([
        { $match: { status: LOAN_STATUS.ACTIVE, isDeleted: false } },
        { $unwind: '$schedule' },
        { $match: { 'schedule.status': EMI_STATUS.OVERDUE } },
        { $group: { _id: '$_id' } },
        { $count: 'count' },
      ]),
      Loan.aggregate([{ $match: { status: LOAN_STATUS.ACTIVE, isDeleted: false } }, { $group: { _id: null, total: { $sum: '$outstandingBalance' } } }]),
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Payment.aggregate([
      { $match: { paidAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const dashboardData = {
      totalClients,
      activeLoans, closedLoans, defaultedLoans, pendingLoans,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      todayCollection: todayCollection[0]?.total || 0,
      monthCollection: monthCollection[0]?.total || 0,
      overdueLoans: overdueCount[0]?.count || 0,
      outstandingBalance: outstandingResult[0]?.total || 0,
      monthlyTrend,
    };

    // Cache for 5 minutes
    await setCache(cacheKey, dashboardData, 300);

    return res.json({
      success: true,
      data: dashboardData,
    });
  } catch (err) { next(err); }
};
