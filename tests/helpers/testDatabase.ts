import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { UserModel } from '../../src/modules/user/user.model.js';
import { PointsLedgerModel } from '../../src/modules/points/points.model.js';
import { CampaignModel } from '../../src/modules/campaign/campaign.model.js';
import { CouponModel } from '../../src/modules/coupon/coupon.model.js';
import { RewardModel, VoucherModel } from '../../src/modules/reward/reward.model.js';
import { BookingModel } from '../../src/modules/booking/booking.model.js';

export let isDbConnected = false;

export const connectTestDb = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 2500,
      });
      isDbConnected = true;
    } else {
      isDbConnected = true;
    }
  } catch (err) {
    console.warn('⚠️ [Test DB] MongoDB connection skipped or offline. Integration tests running in simulated mode.');
    isDbConnected = false;
  }
};

export const clearTestDb = async () => {
  if (!isDbConnected || mongoose.connection.readyState === 0) return;

  const collections = [
    TenantModel,
    UserModel,
    PointsLedgerModel,
    CampaignModel,
    CouponModel,
    RewardModel,
    VoucherModel,
    BookingModel,
  ];

  for (const model of collections) {
    try {
      await model.deleteMany({});
    } catch {}
  }
};

export const disconnectTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

export const createTestToken = (payload: { id: string; role: string; tenantId?: string }) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
};
