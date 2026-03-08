const express = require('express');
const router = express.Router();
const {
  getDailyReport, getOverdueReport, getInterestReport, getClientReport,
  getLoansReport, downloadDailyPDF, downloadDailyExcel, downloadDailyCSV,
  getFieldOfficerReport, getCenterPerformanceReport
} = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/daily', getDailyReport);
router.get('/daily/pdf', downloadDailyPDF);
router.get('/daily/excel', downloadDailyExcel);
router.get('/daily/csv', downloadDailyCSV);
router.get('/overdue', getOverdueReport);
router.get('/field-officer', getFieldOfficerReport);
router.get('/center-performance', getCenterPerformanceReport);
router.get('/interest', getInterestReport);
router.get('/clients', getClientReport);
router.get('/loans', getLoansReport);

module.exports = router;
