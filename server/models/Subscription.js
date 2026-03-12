const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      required: true,
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
      default: 'trialing',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    features: {
      maxUsers: { type: Number, default: 10 },
      analytics: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      auditLogs: { type: Boolean, default: true },
    },
    pricing: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    externalId: {
      // Stripe subscription ID etc.
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for quick status checks
subscriptionSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
