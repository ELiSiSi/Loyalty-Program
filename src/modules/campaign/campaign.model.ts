import mongoose, { Schema } from 'mongoose';
import { ICampaign } from './campaign.types.js';

const campaignSchema = new Schema<ICampaign>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide campaign title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['POINTS_MULTIPLIER', 'FLAT_BONUS', 'CATEGORY_BONUS'],
      default: 'POINTS_MULTIPLIER',
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Please provide campaign value (multiplier or bonus points)'],
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    minimumSpend: {
      type: Number,
      default: 0,
    },
    eligibleTiers: {
      type: [String],
      default: ['bronze', 'silver', 'gold', 'platinum'],
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    maxBudgetPoints: {
      type: Number,
    },
    pointsDistributed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'offers',
  }
);

campaignSchema.index({ tenantId: 1, isActive: 1, startsAt: 1, endsAt: 1 });

export const CampaignModel =
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', campaignSchema);

export const OfferModel = CampaignModel;
