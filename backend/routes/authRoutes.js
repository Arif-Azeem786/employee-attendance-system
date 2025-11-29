const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Register
 * POST /api/auth/register
 */
router.post('/register', register);

/**
 * Login
 * POST /api/auth/login
 */
router.post('/login', login);

/**
 * Get current user
 * GET /api/auth/me
 * Protected
 */
router.get('/me', protect, me);

module.exports = router;
