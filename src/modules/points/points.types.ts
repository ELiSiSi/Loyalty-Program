import { Document, Types } from 'mongoose';

export type PointTransactionType =
  | 'EARN'
  | 'REDEEM'
  | 'BONUS'
  | 'EXPIRY'
  | 'REFUND'
  | 'MANUAL_ADJUSTMENT'
  | 'SIGNUP_REWARD';

export type PointReferenceType =
  | 'ORDER'
  | 'BOOKING'
  | 'CAMPAIGN'
  | 'REWARD'
  | 'COUPON'
  | 'ADMIN';

export interface IPointsLedger extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  type: PointTransactionType;
  amount: number;
  balanceAfter: number;
  referenceType?: PointReferenceType;
  referenceId?: string;
  idempotencyKey?: string;
  description: string;
  expiresAt?: Date;
  isExpired: boolean;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
