const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  myHistory,
  mySummary,
  todayStatus,
  getAll,
  getEmployee,
  teamSummary,
  exportCSV,
  todayTeamStatus
} = require('../controllers/attendanceController');

const { protect, allowManager } = require('../middleware/authMiddleware');

// Employee attendance routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my-history', protect, myHistory);
router.get('/my-summary', protect, mySummary);
router.get('/today', protect, todayStatus);

// Manager routes (protected & role-based)
router.get('/all', protect, allowManager, getAll);
router.get('/employee/:id', protect, allowManager, getEmployee);
router.get('/summary', protect, allowManager, teamSummary);
router.get('/export', protect, allowManager, exportCSV);
router.get('/today-status', protect, allowManager, todayTeamStatus);

module.exports = router;
