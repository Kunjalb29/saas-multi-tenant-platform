const { body } = require('express-validator');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const jwtService = require('../services/jwtService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new organisation and admin user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orgName, firstName, lastName, email, password]
 *             properties:
 *               orgName: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Organisation registered successfully
 *       409:
 *         description: Email or organisation already exists
 */
const register = async (req, res) => {
  try {
    const { orgName, firstName, lastName, email, password, industry, size } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    // Generate unique slug for the tenant
    let slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const slugExists = await Tenant.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the Tenant (organisation)
    const tenant = await Tenant.create({
      name: orgName,
      slug,
      metadata: { industry: industry || '', size: size || '' },
      plan: 'free',
    });

    // Create the admin User
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'tenant_admin',
      tenantId: tenant._id,
    });

    // Set the tenant owner
    tenant.ownerId = user._id;
    await tenant.save();

    // Create default subscription (free trial)
    await Subscription.create({
      tenantId: tenant._id,
      plan: 'free',
      status: 'trialing',
    });

    // Generate token pair
    const { accessToken, refreshToken } = jwtService.generateTokenPair(user);

    // Store hashed refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Audit log
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      action: 'auth.register',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    logger.info(`New organisation registered: ${orgName} (${email})`);

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: user.toSafeObject(),
        tenant: {
          _id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
        },
      },
      'Organisation registered successfully',
      201
    );
  } catch (error) {
    logger.error('Registration error:', error);
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('tenantId', 'name slug plan isActive');

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact your administrator.', 403);
    }

    if (user.tenantId && !user.tenantId.isActive && user.role !== 'super_admin') {
      return sendError(res, 'Your organisation account has been suspended.', 403);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLog.create({
        tenantId: user.tenantId?._id,
        userId: user._id,
        action: 'auth.login_failed',
        resource: 'User',
        resourceId: user._id,
        status: 'failure',
        ipAddress: req.ip,
      });
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = jwtService.generateTokenPair(user);

    // Update user
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Audit log
    await AuditLog.create({
      tenantId: user.tenantId?._id,
      userId: user._id,
      action: 'auth.login',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(res, {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
      tenant: user.tenantId || null,
    }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    return sendError(res, 'Login failed', 500);
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     security: []
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return sendError(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Generate new token pair (rotation)
    const { accessToken, refreshToken: newRefreshToken } = jwtService.generateTokenPair(user);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
  } catch (error) {
    return sendError(res, 'Token refresh failed', 401);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags: [Authentication]
 */
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 'Logout failed', 500);
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('tenantId', 'name slug plan settings isActive');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, { user: user.toSafeObject() }, 'Profile fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch profile', 500);
  }
};

// Validation rules
const registerValidation = [
  body('orgName').trim().notEmpty().withMessage('Organisation name is required').isLength({ min: 2, max: 100 }),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  registerValidation,
  loginValidation,
};
