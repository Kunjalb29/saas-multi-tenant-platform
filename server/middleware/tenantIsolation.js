const { sendError } = require('../utils/apiResponse');

/**
 * Tenant Isolation Middleware
 *
 * Ensures that:
 * 1. Super admins can optionally scope to a tenantId via query param or header
 * 2. All other roles can only access their own tenant's data
 * 3. tenantId is always available on req.tenantId for downstream controllers
 */
const tenantIsolation = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  const { role, tenantId } = req.user;

  if (role === 'super_admin') {
    // Super admin can scope to any tenant via header or param
    const scopedTenant =
      req.headers['x-tenant-id'] ||
      req.query.tenantId ||
      req.body?.tenantId ||
      null;
    req.tenantId = scopedTenant || null; // null means platform-wide access
    return next();
  }

  if (!tenantId) {
    return sendError(res, 'Tenant context is missing from your account', 403);
  }

  // Enforce tenant scope for all non-super-admin users
  req.tenantId = tenantId;

  // If a tenantId is in params (e.g. /tenants/:tenantId), verify it matches
  if (req.params.tenantId && req.params.tenantId !== String(tenantId)) {
    return sendError(res, 'You do not have access to this tenant', 403);
  }

  next();
};

/**
 * Middleware to validate that a resource belongs to the request's tenant.
 * Used inline in controllers after fetching a document.
 */
const assertTenantOwnership = (document, tenantId) => {
  if (!document) return false;
  return String(document.tenantId) === String(tenantId);
};

module.exports = { tenantIsolation, assertTenantOwnership };
