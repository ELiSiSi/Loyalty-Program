import { Document, Types } from 'mongoose';

export interface IReward extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  title: string;
  description?: string;
  pointsCost: number;
  stockQuantity: number;
  image: string;
  isActive: boolean;
  expiryDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export type VoucherStatus = 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export interface IVoucher extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  voucherCode: string;
  pointsDeducted: number;
  status: VoucherStatus;
  expiresAt: Date;
  redeemedAt?: Date;
  claimedByStaff?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
