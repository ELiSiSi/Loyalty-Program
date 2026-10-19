import { Document, Types } from 'mongoose';
import { TenantPlan, TenantStatus } from '../../types/index.js';

export interface ITenantSettings {
  currency: string;
  pointsPercentage: number;
  pointsExpiryDays: number;
  tierBonusEnabled: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface ITenantLimits {
  maxUsers: number;
  maxCampaigns: number;
  monthlyTransactionLimit: number;
}

export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  code: string;
  category: string;
  logo: string;
  status: TenantStatus;
  plan: TenantPlan;
  settings: ITenantSettings;
  limits: ITenantLimits;
  owner?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
