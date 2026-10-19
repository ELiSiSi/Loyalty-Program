import mongoose, { Schema } from 'mongoose';
import { IPointsLedger } from './points.types.js';

const pointsLedgerSchema = new Schema<IPointsLedger>(
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
    type: {
      type: String,
      enum: ['EARN', 'REDEEM', 'BONUS', 'EXPIRY', 'REFUND', 'MANUAL_ADJUSTMENT', 'SIGNUP_REWARD'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['ORDER', 'BOOKING', 'CAMPAIGN', 'REWARD', 'COUPON', 'ADMIN'],
      index: true,
    },
    referenceId: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'points_ledger',
  }
);

// High-performance compound indexes for ledger queries and multi-tenancy
pointsLedgerSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
pointsLedgerSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
pointsLedgerSchema.index({ expiresAt: 1, isExpired: 1, status: 1 });

export const PointsLedgerModel =
  mongoose.models.PointsLedger || mongoose.model<IPointsLedger>('PointsLedger', pointsLedgerSchema);

export const PointModel = PointsLedgerModel;
