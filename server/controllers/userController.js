const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { assertTenantOwnership } = require('../middleware/tenantIsolation');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users in the current tenant
 *     tags: [Users]
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const filter = { tenantId: req.tenantId };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('invitedBy', 'firstName lastName email'),
      User.countDocuments(filter),
    ]);

    return sendPaginated(
      res,
      users,
      { total, page, limit, totalPages: Math.ceil(total / limit) },
      'Users fetched'
    );
  } catch (error) {
    logger.error('getUsers error:', error);
    return sendError(res, 'Failed to fetch users', 500);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (tenant-scoped)
 *     tags: [Users]
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    }).select('-password -refreshToken');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user }, 'User fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch user', 500);
  }
};

/**
 * Invite a new user to the organisation
 */
const inviteUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user' } = req.body;

    // Only tenant_admin can invite
    if (!['user', 'tenant_admin'].includes(role)) {
      return sendError(res, 'Invalid role. Must be user or tenant_admin', 400);
    }

    // Prevent duplicates
    const existingUser = await User.findOne({ email: email.toLowerCase(), tenantId: req.tenantId });
    if (existingUser) {
      return sendError(res, 'A user with this email already exists in your organisation', 409);
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    const newUser = await User.create({
      email,
      password: tempPassword,
      firstName,
      lastName,
      role,
      tenantId: req.tenantId,
      invitedBy: req.user.id,
    });

    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'user.invited',
      resource: 'User',
      resourceId: newUser._id,
      metadata: { invitedEmail: email, assignedRole: role },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      { user: newUser.toSafeObject(), temporaryPassword: tempPassword },
      'User invited successfully',
      201
    );
  } catch (error) {
    logger.error('inviteUser error:', error);
    return sendError(res, 'Failed to invite user', 500);
  }
};

/**
 * Update a user's role or profile
 */
const updateUser = async (req, res) => {
  try {
    const { role, firstName, lastName, profile, isActive } = req.body;
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent downgrading the tenant owner
    if (String(user._id) === String(req.user.id) && role && role !== user.role) {
      return sendError(res, 'You cannot change your own role', 400);
    }

    if (role) user.role = role;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'user.updated',
      resource: 'User',
      resourceId: user._id,
      metadata: { changes: req.body },
      ipAddress: req.ip,
    });

    return sendSuccess(res, { user: user.toSafeObject() }, 'User updated');
  } catch (error) {
    return sendError(res, 'Failed to update user', 500);
  }
};

/**
 * Deactivate a user
 */
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!user) return sendError(res, 'User not found', 404);
    if (String(user._id) === String(req.user.id)) {
      return sendError(res, 'You cannot deactivate your own account', 400);
    }

    user.isActive = false;
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'user.deactivated',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {}, 'User deactivated');
  } catch (error) {
    return sendError(res, 'Failed to deactivate user', 500);
  }
};

/**
 * Update own profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName, profile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profile) user.profile = { ...user.profile.toObject(), ...profile };

    await user.save();
    return sendSuccess(res, { user: user.toSafeObject() }, 'Profile updated');
  } catch (error) {
    return sendError(res, 'Failed to update profile', 500);
  }
};

module.exports = {
  getUsers,
  getUserById,
  inviteUser,
  updateUser,
  deactivateUser,
  updateMyProfile,
};
