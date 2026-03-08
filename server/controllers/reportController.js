const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @route GET /api/reports/daily
exports.getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const payments = await Payment.find({ paidAt: { $gte: start, $lte: end } })
      .populate('loanId', 'loanNumber')
      .populate('clientId', 'name phone')
      .populate('collectedBy', 'name');

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return res.json({ success: true, data: { payments, total, date: start } });
  } catch (err) { next(err); }
};

// @route GET /api/reports/overdue
exports.getOverdueReport = async (req, res, next) => {
  try {
    const loans = await Loan.find({ status: { $in: [LOAN_STATUS.ACTIVE, LOAN_STATUS.DEFAULTED] }, isDeleted: false })
      .populate('clientId', 'name phone aadhaar')
      .populate('groupId', 'groupName centerCode riskCategory village');

    const overdueLoans = loans.map((loan) => {
      const overdueEmis = loan.schedule.filter((e) => e.status === EMI_STATUS.OVERDUE);
      const totalPenalty = overdueEmis.reduce((sum, e) => sum + (e.penalty || 0), 0);
      const totalOverdueAmt = overdueEmis.reduce((sum, e) => sum + (e.emi - e.paidAmount + e.penalty), 0);
      return {
        loan,
        overdueEmis: overdueEmis.length,
        totalPenalty,
        totalOverdueAmt,
        group: loan.groupId?.groupName,
        centerCode: loan.groupId?.centerCode,
        risk: loan.groupId?.riskCategory || 'low'
      };
    }).filter((item) => item.overdueEmis > 0);

    return res.json({ success: true, data: overdueLoans });
  } catch (err) { next(err); }
};

// @route GET /api/reports/field-officer
exports.getFieldOfficerReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.paidAt = {};
      if (from) query.paidAt.$gte = new Date(from);
      if (to) { const end = new Date(to); end.setHours(23, 59, 59); query.paidAt.$lte = end; }
    }

    const report = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$collectedBy",
          totalCollected: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer"
        }
      },
      { $unwind: "$officer" },
      {
        $project: {
          _id: 1,
          name: "$officer.name",
          totalCollected: 1,
          count: 1
        }
      }
    ]);

    return res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

// @route GET /api/reports/center-performance
exports.getCenterPerformanceReport = async (req, res, next) => {
  try {
    const groups = await Group.find({ isDeleted: false });
    const report = await Promise.all(groups.map(async (group) => {
      const loans = await Loan.find({ groupId: group._id, isDeleted: false });
      const totalOutstanding = loans.reduce((s, l) => s + l.outstandingBalance, 0);
      const activeCount = loans.filter(l => l.status === LOAN_STATUS.ACTIVE).length;

      const payments = await Payment.find({ groupId: group._id });
      const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

      return {
        _id: group._id,
        groupName: group.groupName,
        centerCode: group.centerCode,
        activeLoans: activeCount,
        totalOutstanding,
        totalCollected,
        riskCategory: group.riskCategory || 'low'
      };
    }));
    return res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

// @route GET /api/reports/interest
exports.getInterestReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.paidAt = {};
      if (from) query.paidAt.$gte = new Date(from);
      if (to) { const end = new Date(to); end.setHours(23, 59, 59); query.paidAt.$lte = end; }
    }
    const payments = await Payment.find(query).populate('loanId', 'loanNumber').populate('clientId', 'name');
    return res.json({ success: true, data: payments });
  } catch (err) { next(err); }
};

// @route GET /api/reports/clients
exports.getClientReport = async (req, res, next) => {
  try {
    const clients = await Client.find({ isDeleted: false });
    const data = await Promise.all(clients.map(async (client) => {
      const loans = await Loan.find({ clientId: client._id, isDeleted: false }).select('principal outstandingBalance status loanNumber');
      const totalLoaned = loans.reduce((s, l) => s + l.principal, 0);
      const totalOutstanding = loans.reduce((s, l) => s + l.outstandingBalance, 0);
      const activeLoans = loans.filter((l) => l.status === 'active').length;
      return { client, loanCount: loans.length, totalLoaned, totalOutstanding, activeLoans };
    }));
    return res.json({ success: true, data });
  } catch (err) { next(err); }
};

// @route GET /api/reports/loans
exports.getLoansReport = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const loans = await Loan.find(query)
      .populate('groupId', 'groupName centerNumber centerName village')
      .populate('members', 'name phone aadhaar')
      .sort({ createdAt: -1 });

    const data = loans.map(loan => ({
      _id: loan._id,
      loanNumber: loan.loanNumber,
      group: loan.groupId?.groupName || 'No Group',
      center: loan.groupId ? `${loan.groupId.centerNumber} - ${loan.groupId.centerName}` : 'N/A',
      village: loan.groupId?.village || 'N/A',
      principal: loan.principal,
      outstanding: loan.outstandingBalance,
      status: loan.status,
      disbursedAt: loan.disbursedAt,
      createdAt: loan.createdAt,
      members: loan.members.map(m => m.name).join(', ')
    }));

    return res.json({ success: true, data });
  } catch (err) { next(err); }
};

// @route GET /api/reports/daily/pdf
exports.downloadDailyPDF = async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const payments = await Payment.find({ paidAt: { $gte: start, $lte: end } })
      .populate('clientId', 'name phone')
      .populate('loanId', 'loanNumber');

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=daily-collection-${start.toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Pahel Finance — Daily Collection Report', { align: 'center' });
    doc.fontSize(12).text(`Date: ${start.toDateString()}`, { align: 'center' });
    doc.moveDown();

    payments.forEach((p, i) => {
      doc.fontSize(10).text(`${i + 1}. ${p.clientId?.name || '-'} | Loan: ${p.loanId?.loanNumber || '-'} | ₹${p.amount} | ${p.paymentMethod} | ${new Date(p.paidAt).toLocaleString()}`);
    });

    const total = payments.reduce((s, p) => s + p.amount, 0);
    doc.moveDown().fontSize(12).text(`Total Collected: ₹${total}`, { align: 'right' });
    doc.end();
  } catch (err) { next(err); }
};

// @route GET /api/reports/daily/excel
exports.downloadDailyExcel = async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const payments = await Payment.find({ paidAt: { $gte: start, $lte: end } })
      .populate('clientId', 'name phone')
      .populate('loanId', 'loanNumber')
      .populate('collectedBy', 'name');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Daily Collection');
    sheet.columns = [
      { header: 'Client', key: 'client', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Loan No', key: 'loanNo', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Method', key: 'method', width: 12 },
      { header: 'Collected By', key: 'by', width: 15 },
      { header: 'Paid At', key: 'paidAt', width: 20 },
    ];
    payments.forEach((p) => {
      sheet.addRow({
        client: p.clientId?.name, phone: p.clientId?.phone,
        loanNo: p.loanId?.loanNumber, amount: p.amount, method: p.paymentMethod,
        by: p.collectedBy?.name, paidAt: new Date(p.paidAt).toLocaleString(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=collection-${start.toISOString().split('T')[0]}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};

// @route GET /api/reports/daily/csv
exports.downloadDailyCSV = async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const payments = await Payment.find({ paidAt: { $gte: start, $lte: end } })
      .populate('clientId', 'name phone')
      .populate('loanId', 'loanNumber')
      .populate('collectedBy', 'name');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=collection-${start.toISOString().split('T')[0]}.csv`);

    let csv = 'Client,Phone,Loan No,Amount,Method,Collected By,Paid At\n';
    payments.forEach((p) => {
      csv += `"${p.clientId?.name || ''}","${p.clientId?.phone || ''}","${p.loanId?.loanNumber || ''}",${p.amount},"${p.paymentMethod}","${p.collectedBy?.name || ''}","${new Date(p.paidAt).toLocaleString()}"\n`;
    });

    return res.send(csv);
  } catch (err) { next(err); }
};
