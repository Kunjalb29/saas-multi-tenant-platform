const express = require('express');
const router = express.Router();
const { getTenantAnalytics, getPlatformAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { tenantIsolation } = require('../middleware/tenantIsolation');

router.use(authenticate);

// Tenant analytics (scoped)
router.get('/tenant', tenantIsolation, authorize('super_admin', 'tenant_admin'), getTenantAnalytics);

// Platform analytics (super admin only)
router.get('/platform', authorize('super_admin'), getPlatformAnalytics);

module.exports = router;
