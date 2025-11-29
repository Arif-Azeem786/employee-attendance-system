const express = require('express');
const router = express.Router();
const { protect, allowManager } = require('../middleware/authMiddleware');
const { employeeDashboard, managerDashboard } = require('../controllers/dashboardController');

router.get('/employee', protect, employeeDashboard);
router.get('/manager', protect, allowManager, managerDashboard);

module.exports = router;

