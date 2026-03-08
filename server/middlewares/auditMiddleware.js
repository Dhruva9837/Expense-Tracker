const AuditLog = require('../models/AuditLog');

const audit = (action, resource, getResourceId = null, getDescription = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const resourceId =
            getResourceId ? getResourceId(req, data) : req.params.id || data?.data?._id;
          const description =
            getDescription ? getDescription(req, data) : `${action} on ${resource}`;

          await AuditLog.create({
            userId: req.user?._id,
            userName: req.user?.name,
            action,
            resource,
            resourceId,
            description,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = audit;
