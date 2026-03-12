const express = require('express');
const router = express.Router();
const {
  getTenant,
  updateTenant,
  getSubscription,
  getAuditLogs,
} = require('../controllers/tenantController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { tenantIsolation } = require('../middleware/tenantIsolation');

router.use(authenticate, tenantIsolation);

router.get('/', authorize('super_admin', 'tenant_admin'), getTenant);
router.put('/', authorize('super_admin', 'tenant_admin'), updateTenant);
router.get('/subscription', authorize('super_admin', 'tenant_admin'), getSubscription);
router.get('/audit-logs', authorize('super_admin', 'tenant_admin'), getAuditLogs);

module.exports = router;
