const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (employee or manager)
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', department, employeeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // auto-generate employeeId for employees if not provided
    let empId = employeeId;
    if (role === 'employee' && !empId) {
      // simple EMP + random 4 digit (ensure uniqueness by re-trying)
      const makeId = async () => `EMP${Math.floor(1000 + Math.random() * 9000)}`;
      let tries = 0;
      do {
        empId = await makeId();
        const exists = await User.findOne({ employeeId: empId });
        if (!exists) break;
        tries++;
      } while (tries < 5);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || '',
      employeeId: empId || undefined
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during register' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info (protected)
 * @access  Private
 */
const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = req.user; // auth middleware attaches user without password
    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  me
};
