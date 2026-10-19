import mongoose, { Schema } from 'mongoose';
import { ITenant } from './tenant.types.js';
import { SAAS_PLANS } from '../../constants/plans.js';

const tenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, 'Please provide company/tenant name'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide tenant slug'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide business category'],
      trim: true,
      default: 'Retail',
    },
    logo: {
      type: String,
      default: 'https://res.cloudinary.com/dr0xirap5/image/upload/v1782557156/uploads/general/default_company_logo.png',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'cancelled'],
      default: 'active',
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'growth', 'enterprise'],
      default: 'free',
      index: true,
    },
    settings: {
      currency: { type: String, default: 'SAR' },
      pointsPercentage: { type: Number, default: 1 }, // 1% points back default
      pointsExpiryDays: { type: Number, default: 365 },
      tierBonusEnabled: { type: Boolean, default: true },
      webhookUrl: { type: String },
      webhookSecret: { type: String },
    },
    limits: {
      maxUsers: { type: Number, default: SAAS_PLANS.FREE.maxUsers },
      maxCampaigns: { type: Number, default: SAAS_PLANS.FREE.maxCampaigns },
      monthlyTransactionLimit: { type: Number, default: SAAS_PLANS.FREE.monthlyTransactionLimit },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

export const TenantModel = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', tenantSchema);
export const CompanyModel = TenantModel;
