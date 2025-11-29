// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Token invalid' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message || error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// middleware to allow only managers (role-based)
const allowManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Forbidden: managers only' });
  }
  next();
};

module.exports = {
  protect,
  allowManager
};
