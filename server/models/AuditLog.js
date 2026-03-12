const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
      // e.g. 'user.created', 'user.deleted', 'tenant.updated', 'auth.login'
    },
    resource: {
      type: String,
      required: true,
      // e.g. 'User', 'Tenant', 'Subscription'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
