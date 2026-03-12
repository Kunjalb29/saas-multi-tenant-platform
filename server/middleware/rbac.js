const { sendError } = require('../utils/apiResponse');

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Usage: authorize('super_admin', 'tenant_admin')
 *
 * Role hierarchy:
 *   super_admin > tenant_admin > user
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Insufficient permissions. Required: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Super admin only shorthand
 */
const superAdminOnly = authorize('super_admin');

/**
 * Admin or above shorthand
 */
const adminOrAbove = authorize('super_admin', 'tenant_admin');

module.exports = { authorize, superAdminOnly, adminOrAbove };
