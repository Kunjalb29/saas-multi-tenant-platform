const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

/**
 * Super Admin: list all tenants
 */
const getAllTenants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const plan = req.query.plan || '';

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }
    if (plan) filter.plan = plan;

    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .populate('ownerId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Tenant.countDocuments(filter),
    ]);

    return sendPaginated(
      res,
      tenants,
      { total, page, limit, totalPages: Math.ceil(total / limit) },
      'All tenants fetched'
    );
  } catch (error) {
    return sendError(res, 'Failed to fetch tenants', 500);
  }
};

/**
 * Super Admin: toggle tenant active status
 */
const toggleTenantStatus = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return sendError(res, 'Tenant not found', 404);

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    return sendSuccess(
      res,
      { tenant },
      `Tenant ${tenant.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    return sendError(res, 'Failed to update tenant status', 500);
  }
};

/**
 * Super Admin: update a tenant's plan
 */
const updateTenantPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true, runValidators: true }
    );
    if (!tenant) return sendError(res, 'Tenant not found', 404);
    return sendSuccess(res, { tenant }, 'Plan updated');
  } catch (error) {
    return sendError(res, 'Failed to update plan', 500);
  }
};

module.exports = { getAllTenants, toggleTenantStatus, updateTenantPlan };
