const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  inviteUser,
  updateUser,
  deactivateUser,
  updateMyProfile,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { tenantIsolation } = require('../middleware/tenantIsolation');

// All routes require authentication + tenant isolation
router.use(authenticate, tenantIsolation);

router.get('/', authorize('super_admin', 'tenant_admin'), getUsers);
router.get('/profile', updateMyProfile); // GET own profile
router.get('/:id', authorize('super_admin', 'tenant_admin'), getUserById);
router.post('/invite', authorize('super_admin', 'tenant_admin'), inviteUser);
router.put('/profile', updateMyProfile);
router.put('/:id', authorize('super_admin', 'tenant_admin'), updateUser);
router.delete('/:id', authorize('super_admin', 'tenant_admin'), deactivateUser);

module.exports = router;
