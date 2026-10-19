import mongoose, { Schema } from 'mongoose';
import { ICoupon } from './coupon.types.js';

const couponSchema = new Schema<ICoupon>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED', 'POINTS_REDUCTION'],
      default: 'PERCENTAGE',
    },
    discount: {
      type: Number,
      required: [true, 'Please specify discount amount/percentage'],
    },
    minSpend: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      default: 1000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'coupons',
  }
);

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });
couponSchema.index({ tenantId: 1, isActive: 1, expiresAt: 1 });

export const CouponModel =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);
