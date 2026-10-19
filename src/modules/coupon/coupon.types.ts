import { Document, Types } from 'mongoose';

export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'POINTS_REDUCTION';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  code: string;
  discountType: DiscountType;
  discount: number; // Percentage (e.g. 15 for 15%) or Fixed amount
  minSpend: number;
  maxDiscount?: number;
  startsAt: Date;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
