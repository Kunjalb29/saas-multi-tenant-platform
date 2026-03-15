const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// @route   POST /api/auth/register
// @desc    Register a new user and map to a tenant
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginValidation, validate, login);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT access token
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
router.post('/logout', authenticate, logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user details
router.get('/me', authenticate, getMe);

module.exports = router;
