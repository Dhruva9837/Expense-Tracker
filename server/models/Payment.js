const mongoose = require('mongoose');
const { PAYMENT_METHODS } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
  {
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), default: PAYMENT_METHODS.CASH },
    transactionRef: { type: String },
    installmentNo: { type: Number }, // which EMI this payment is for
    penalty: { type: Number, default: 0 },
    notes: String,
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ paidAt: 1 });
paymentSchema.index({ loanId: 1, paidAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
