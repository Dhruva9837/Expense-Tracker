const express = require('express');
const router = express.Router();
const { getDashboardKPI } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

router.get('/kpi', protect, getDashboardKPI);

module.exports = router;
