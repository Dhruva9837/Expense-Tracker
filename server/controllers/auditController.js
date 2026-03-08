const AuditLog = require('../models/AuditLog');

// @route GET /api/audit
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { resource, userId, page = 1, limit = 20, from, to } = req.query;
    const query = {};
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) { const end = new Date(to); end.setHours(23, 59, 59); query.createdAt.$lte = end; }
    }
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true, data: logs,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};
