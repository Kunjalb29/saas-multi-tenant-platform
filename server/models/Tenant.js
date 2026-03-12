const mongoose = require('mongoose');

/**
 * Tenant model – represents an organisation in the multi-tenant system.
 * Each tenant has isolated data scoped by their _id (tenantId).
 */
const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organisation name is required'],
      trim: true,
      maxlength: [100, 'Organisation name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    domain: {
      type: String,
      default: null,
      lowercase: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowInvites: { type: Boolean, default: true },
      maxUsers: { type: Number, default: 10 },
      features: {
        analytics: { type: Boolean, default: false },
        customDomain: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
        auditLogs: { type: Boolean, default: true },
      },
      branding: {
        primaryColor: { type: String, default: '#6366f1' },
        logoUrl: { type: String, default: null },
      },
    },
    metadata: {
      industry: { type: String, default: '' },
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+', ''],
        default: '',
      },
      country: { type: String, default: '' },
    },
    userCount: {
      type: Number,
      default: 1,
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from name if not provided
tenantSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  next();
});

tenantSchema.virtual('isOnTrial').get(function () {
  return this.trialEndsAt && new Date() < this.trialEndsAt;
});

tenantSchema.index({ slug: 1 });
tenantSchema.index({ isActive: 1 });
tenantSchema.index({ plan: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
