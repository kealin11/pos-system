import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const normalizeRole = (role) => {
  if (role === 'admin') return 'admin';
  if (role === 'cashier' || role === 'staff') return 'cashier';
  return 'cashier';
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'admin') {
    res.status(403);
    throw new Error('Admin accounts must be created by the system administrator');
  }

  const user = await User.create({ name, email, password, role: normalizedRole });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      token: generateToken(user._id),
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated. Contact admin.');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    },
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
