const express = require('express');
const router = express.Router();
const { getAllTenants, toggleTenantStatus, updateTenantPlan } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/rbac');

router.use(authenticate, superAdminOnly);

router.get('/tenants', getAllTenants);
router.patch('/tenants/:id/status', toggleTenantStatus);
router.patch('/tenants/:id/plan', updateTenantPlan);

module.exports = router;
