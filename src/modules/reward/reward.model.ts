import mongoose, { Schema } from 'mongoose';
import { IReward, IVoucher } from './reward.types.js';

const rewardSchema = new Schema<IReward>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide reward title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pointsCost: {
      type: Number,
      required: [true, 'Please provide points required for redemption'],
      min: 1,
    },
    stockQuantity: {
      type: Number,
      default: 100,
      min: 0,
    },
    image: {
      type: String,
      default: 'https://res.cloudinary.com/dr0xirap5/image/upload/v1782557156/uploads/general/reward_default.png',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiryDays: {
      type: Number,
      default: 30, // Voucher expires 30 days after redemption
    },
  },
  {
    timestamps: true,
    collection: 'gifts',
  }
);

rewardSchema.index({ tenantId: 1, isActive: 1, pointsCost: 1 });

export const RewardModel =
  mongoose.models.Reward || mongoose.model<IReward>('Reward', rewardSchema);

export const GiftModel = RewardModel;

const voucherSchema = new Schema<IVoucher>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    voucherCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    pointsDeducted: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['ISSUED', 'REDEEMED', 'EXPIRED', 'CANCELLED'],
      default: 'ISSUED',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    redeemedAt: {
      type: Date,
    },
    claimedByStaff: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'vouchers',
  }
);

voucherSchema.index({ tenantId: 1, userId: 1, status: 1 });

export const VoucherModel =
  mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', voucherSchema);
