const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    action: { type: String, required: true }, // CREATE, UPDATE, DELETE, LOGIN, etc.
    resource: { type: String, required: true }, // Client, Loan, Payment, User
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    description: String,
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
