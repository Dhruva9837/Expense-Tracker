const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect, notViewer } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(notViewer, createPayment);

module.exports = router;
