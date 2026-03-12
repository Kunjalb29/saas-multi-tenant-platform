const User = require('../models/User');
const Tenant = require('../models/Tenant');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Get tenant-specific analytics data
 */
const getTenantAnalytics = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      recentActivity,
      roleDistribution,
    ] = await Promise.all([
      User.countDocuments({ tenantId }),
      User.countDocuments({ tenantId, isActive: true }),
      User.countDocuments({ tenantId, createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ tenantId, createdAt: { $gte: sevenDaysAgo } }),
      AuditLog.find({ tenantId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName email'),
      User.aggregate([
        { $match: { tenantId: require('mongoose').Types.ObjectId.createFromHexString(String(tenantId)) } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    // User growth (last 7 days)
    const userGrowth = await User.aggregate([
      {
        $match: {
          tenantId: require('mongoose').Types.ObjectId.createFromHexString(String(tenantId)),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth,
        newUsersThisWeek,
      },
      roleDistribution,
      userGrowth,
      recentActivity,
    }, 'Analytics fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics', 500);
  }
};

/**
 * Get platform-wide analytics (super admin only)
 */
const getPlatformAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTenants,
      activeTenants,
      totalUsers,
      newTenantsThisMonth,
      planDistribution,
    ] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'super_admin' } }),
      Tenant.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Tenant.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]),
    ]);

    // Tenant growth (last 30 days)
    const tenantGrowth = await Tenant.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, {
      overview: {
        totalTenants,
        activeTenants,
        totalUsers,
        newTenantsThisMonth,
      },
      planDistribution,
      tenantGrowth,
    }, 'Platform analytics fetched');
  } catch (error) {
    return sendError(res, 'Failed to fetch platform analytics', 500);
  }
};

module.exports = { getTenantAnalytics, getPlatformAnalytics };
