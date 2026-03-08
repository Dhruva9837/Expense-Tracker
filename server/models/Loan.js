const mongoose = require('mongoose');
const { LOAN_STATUS, EMI_STATUS } = require('../config/constants');

const emiSchema = new mongoose.Schema({
  installmentNo: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  principal: { type: Number, required: true },
  interest: { type: Number, required: true },
  emi: { type: Number, required: true },
  balance: { type: Number, required: true },
  status: { type: String, enum: Object.values(EMI_STATUS), default: EMI_STATUS.PENDING },
  paidAmount: { type: Number, default: 0 },
  paidAt: { type: Date },
  penalty: { type: Number, default: 0 },
});

const activitySchema = new mongoose.Schema({
  action: String,
  description: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedAt: { type: Date, default: Date.now },
});

const loanSchema = new mongoose.Schema(
  {
    loanNumber: { type: String, unique: true, index: true },
    loanType: { type: String, enum: ['GROUP', 'INDIVIDUAL'], default: 'GROUP' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    principal: { type: Number, required: true },
    emiFrequency: {
      type: String,
      enum: ["Monthly", "15 Days", "Weekly"],
      required: true,
      default: "Monthly"
    },
    tenure: { type: Number, required: true }, // months
    emiAmount: { type: Number },
    disbursedAt: { type: Date },
    maturityDate: { type: Date },
    status: { type: String, enum: Object.values(LOAN_STATUS), default: LOAN_STATUS.PENDING },
    purpose: String,
    outstandingBalance: { type: Number },
    totalInterest: { type: Number },
    totalAmount: { type: Number }, // principal + totalInterest
    prepaidAmount: { type: Number, default: 0 },
    penaltyRate: { type: Number, default: 2 }, // % per day
    schedule: [emiSchema],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
    agreementPath: String,
    activityTimeline: [activitySchema],
    closedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

loanSchema.index({ groupId: 1, status: 1 });
loanSchema.pre('save', function () {
  if (!this.loanNumber) {
    this.loanNumber = 'LN' + Date.now().toString().slice(-8);
  }
});

module.exports = mongoose.model('Loan', loanSchema);
