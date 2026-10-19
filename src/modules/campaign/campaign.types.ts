import { Document, Types } from 'mongoose';

export type CampaignType = 'POINTS_MULTIPLIER' | 'FLAT_BONUS' | 'CATEGORY_BONUS';

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  title: string;
  description?: string;
  type: CampaignType;
  value: number; // e.g. 2 for 2x multiplier, or 500 for 500 bonus points
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  minimumSpend: number;
  eligibleTiers: string[];
  applicableCategories: string[];
  maxBudgetPoints?: number;
  pointsDistributed: number;
  createdAt: Date;
  updatedAt: Date;
}
