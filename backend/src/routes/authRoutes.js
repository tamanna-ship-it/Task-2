const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  findUserById,
  getUserCount,
  createUser,
  validatePassword,
  sanitizeUser
} = require('../models/userModel');

const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper login handler for role-specific & general login
const processLogin = async (req, res, requiredRole = null) => {
  try {
    const { email, password } = req.body;

    // Validation: 400 Bad Request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email address and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Look up user
    let user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User account not found.'
      });
    }

    // Verify role if endpoint requires specific role
    if (requiredRole && user.role !== requiredRole) {
      return res.status(401).json({
        success: false,
        message: `Unauthorized role login. Account '${normalizedEmail}' belongs to '${user.role}' role, not '${requiredRole}'.`
      });
    }

    // Verify password: 401 Unauthorized
    const isMatch = await validatePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // Generate JWT Token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET || 'estetica_super_secret_jwt_key_2026_role_based_auth';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(payload, secret, { expiresIn });
    const cleanUser = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: `${user.role.toUpperCase()} authentication successful`,
      token,
      user: cleanUser
    });
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// @route   POST /api/auth/owner/login
// @desc    Authenticate Owner credentials
// @access  Public
router.post('/owner/login', (req, res) => processLogin(req, res, 'owner'));

// @route   POST /api/auth/manager/login
// @desc    Authenticate Manager credentials
// @access  Public
router.post('/manager/login', (req, res) => processLogin(req, res, 'manager'));

// @route   POST /api/auth/staff/login
// @desc    Authenticate Staff credentials
// @access  Public
router.post('/staff/login', (req, res) => processLogin(req, res, 'staff'));

// @route   POST /api/auth/login
// @desc    General authentication endpoint
// @access  Public
router.post('/login', (req, res) => processLogin(req, res, null));

// @route   GET /api/auth/me
// @desc    Get current logged in user details from JWT token
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
});

module.exports = router;
