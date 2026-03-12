const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get current tenant info
 */
const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId).populate('ownerId', 'firstName lastName email');
    if (!tenant) return sendError(res, 'Tenant not found', 404);
    return sendSuccess(res, { tenant }, 'Tenant fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch tenant', 500);
  }
};

/**
 * Update current tenant settings
 */
const updateTenant = async (req, res) => {
  try {
    const { name, settings, metadata } = req.body;
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return sendError(res, 'Tenant not found', 404);

    if (name) tenant.name = name;
    if (settings) tenant.settings = { ...tenant.settings.toObject(), ...settings };
    if (metadata) tenant.metadata = { ...tenant.metadata.toObject(), ...metadata };

    await tenant.save();

    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'tenant.updated',
      resource: 'Tenant',
      resourceId: tenant._id,
      metadata: { changes: req.body },
      ipAddress: req.ip,
    });

    return sendSuccess(res, { tenant }, 'Tenant updated');
  } catch (error) {
    return sendError(res, 'Failed to update tenant', 500);
  }
};

/**
 * Get tenant subscription
 */
const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ tenantId: req.tenantId });
    return sendSuccess(res, { subscription }, 'Subscription fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch subscription', 500);
  }
};

/**
 * Get tenant audit logs (paginated)
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ tenantId: req.tenantId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email'),
      AuditLog.countDocuments({ tenantId: req.tenantId }),
    ]);

    return sendPaginated(
      res,
      logs,
      { total, page, limit, totalPages: Math.ceil(total / limit) },
      'Audit logs fetched'
    );
  } catch (error) {
    return sendError(res, 'Failed to fetch audit logs', 500);
  }
};

module.exports = { getTenant, updateTenant, getSubscription, getAuditLogs };
