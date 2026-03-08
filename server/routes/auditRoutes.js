const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('admin'), getAuditLogs);

module.exports = router;
