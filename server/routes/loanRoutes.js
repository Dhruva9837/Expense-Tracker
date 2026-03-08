const express = require('express');
const router = express.Router();
const {
  getLoans, getLoan, createLoan, getSchedule, updateLoanStatus, prepayLoan,
} = require('../controllers/loanController');
const { protect, notViewer } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.route('/')
  .get(getLoans)
  .post(notViewer, createLoan);

router.route('/:id')
  .get(getLoan);

router.get('/:id/schedule', getSchedule);
router.put('/:id/status', notViewer, updateLoanStatus);
router.post('/:id/prepay', notViewer, prepayLoan);

module.exports = router;
