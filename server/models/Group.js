const mongoose = require('mongoose');
const { GROUP_STATUS, RISK_CATEGORY } = require('../config/constants');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, trim: true },
  groupHead: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
    validate: [v => v.length <= 10, 'Group cannot have more than 10 members']
  },
  centerNumber: { type: String, required: true },
  centerName: { type: String, required: true },
  centerCode: { type: String, unique: true },
  village: { type: String, required: true },
  meetingDay: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  collectionAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riskCategory: { type: String, enum: Object.values(RISK_CATEGORY), default: RISK_CATEGORY.LOW },
  status: { type: String, enum: Object.values(GROUP_STATUS), default: GROUP_STATUS.ACTIVE },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

groupSchema.index({ groupName: 'text', centerNumber: 'text', centerName: 'text', centerCode: 'text', village: 'text' });

module.exports = mongoose.model('Group', groupSchema);
