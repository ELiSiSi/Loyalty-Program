import mongoose from 'mongoose';
import { PointsLedgerModel } from './points.model.js';
import { IPointsLedger, PointReferenceType } from './points.types.js';
import { UserModel } from '../user/user.model.js';
import { TenantModel } from '../tenant/tenant.model.js';
import { UserService } from '../user/user.service.js';
import { BadRequestError, NotFoundError } from '../../errors/appError.js';
import { VIP_TIERS } from '../../constants/tiers.js';
import { WebhookService } from '../webhook/webhook.service.js';

export class PointsService {
  /**
   * Concurrency-safe atomic points credit
   */
  static async earnPoints(params: {
    tenantId: string;
    userId: string;
    amount: number;
    referenceType?: PointReferenceType;
    referenceId?: string;
    description: string;
    idempotencyKey?: string;
    actorId?: string;
    isBonus?: boolean;
  }): Promise<{ transaction: IPointsLedger; newBalance: number }> {
    const { tenantId, userId, amount, referenceType, referenceId, description, idempotencyKey, actorId, isBonus } =
      params;

    if (amount <= 0) {
      throw new BadRequestError('Earn amount must be greater than zero.');
    }

    // Check Idempotency Key in ledger
    if (idempotencyKey) {
      const existing = await PointsLedgerModel.findOne({ tenantId, idempotencyKey });
      if (existing) {
        return { transaction: existing, newBalance: existing.balanceAfter };
      }
    }

    const tenant = await TenantModel.findById(tenantId);
    const expiryDays = tenant?.settings?.pointsExpiryDays ?? 365;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Atomic increment in UserModel
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          availablePoints: amount,
          totalPoints: amount,
          lifetimePoints: amount,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new NotFoundError('Target user not found.');
    }

    // Create immutable ledger entry
    const transaction = await PointsLedgerModel.create({
      tenantId,
      userId,
      type: isBonus ? 'BONUS' : 'EARN',
      amount,
      balanceAfter: updatedUser.availablePoints,
      referenceType: referenceType || 'ORDER',
      referenceId,
      idempotencyKey,
      description,
      expiresAt,
      isExpired: false,
      status: 'CONFIRMED',
      createdBy: actorId,
    });

    // Check automatic VIP tier upgrade
    await UserService.recalculateVipTier(userId);

    // Emit SaaS Webhook event asynchronously
    WebhookService.dispatchEvent(tenantId, 'points.earned', {
      userId,
      amount,
      balanceAfter: updatedUser.availablePoints,
      transactionId: transaction._id.toString(),
      referenceType,
      referenceId,
    }).catch(() => {});

    return { transaction, newBalance: updatedUser.availablePoints };
  }

  /**
   * Concurrency-safe atomic points debit (prevents negative balance)
   */
  static async redeemPoints(params: {
    tenantId: string;
    userId: string;
    amount: number;
    referenceType?: PointReferenceType;
    referenceId?: string;
    description: string;
    idempotencyKey?: string;
    actorId?: string;
  }): Promise<{ transaction: IPointsLedger; newBalance: number }> {
    const { tenantId, userId, amount, referenceType, referenceId, description, idempotencyKey, actorId } = params;

    if (amount <= 0) {
      throw new BadRequestError('Redemption amount must be greater than zero.');
    }

    // Check Idempotency Key
    if (idempotencyKey) {
      const existing = await PointsLedgerModel.findOne({ tenantId, idempotencyKey });
      if (existing) {
        return { transaction: existing, newBalance: existing.balanceAfter };
      }
    }

    // Atomic conditional decrement: strictly requires availablePoints >= amount
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        availablePoints: { $gte: amount },
      },
      {
        $inc: {
          availablePoints: -amount,
          totalPoints: -amount,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      const currentUser = await UserModel.findById(userId);
      if (!currentUser) throw new NotFoundError('Target user not found.');
      throw new BadRequestError(
        `Insufficient points balance. You have ${currentUser.availablePoints} points, but attempted to redeem ${amount}.`
      );
    }

    // Create immutable ledger entry
    const transaction = await PointsLedgerModel.create({
      tenantId,
      userId,
      type: 'REDEEM',
      amount: -amount,
      balanceAfter: updatedUser.availablePoints,
      referenceType: referenceType || 'REWARD',
      referenceId,
      idempotencyKey,
      description,
      isExpired: false,
      status: 'CONFIRMED',
      createdBy: actorId,
    });

    // Emit SaaS Webhook event asynchronously
    WebhookService.dispatchEvent(tenantId, 'points.redeemed', {
      userId,
      amount,
      balanceAfter: updatedUser.availablePoints,
      transactionId: transaction._id.toString(),
      referenceType,
      referenceId,
    }).catch(() => {});

    return { transaction, newBalance: updatedUser.availablePoints };
  }

  /**
   * Manual adjustment by Admin / Staff
   */
  static async adjustPoints(params: {
    tenantId: string;
    userId: string;
    amount: number;
    reason: string;
    actorId: string;
  }): Promise<{ transaction: IPointsLedger; newBalance: number }> {
    const { tenantId, userId, amount, reason, actorId } = params;

    let updatedUser;
    if (amount < 0) {
      const absAmount = Math.abs(amount);
      updatedUser = await UserModel.findOneAndUpdate(
        { _id: userId, availablePoints: { $gte: absAmount } },
        { $inc: { availablePoints: amount, totalPoints: amount } },
        { new: true }
      );
      if (!updatedUser) {
        throw new BadRequestError('User does not have enough points to deduct this adjustment.');
      }
    } else {
      updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { availablePoints: amount, totalPoints: amount, lifetimePoints: amount } },
        { new: true }
      );
    }

    if (!updatedUser) throw new NotFoundError('User not found.');

    const transaction = await PointsLedgerModel.create({
      tenantId,
      userId,
      type: 'MANUAL_ADJUSTMENT',
      amount,
      balanceAfter: updatedUser.availablePoints,
      referenceType: 'ADMIN',
      description: `Manual adjustment by staff: ${reason}`,
      status: 'CONFIRMED',
      createdBy: actorId,
    });

    return { transaction, newBalance: updatedUser.availablePoints };
  }

  /**
   * Smart points calculation engine
   */
  static async calculateOrderPoints(params: {
    tenantId: string;
    orderAmount: number;
    userId?: string;
  }) {
    const { tenantId, orderAmount, userId } = params;
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found.');

    const pointsPercentage = tenant.settings?.pointsPercentage ?? 1;
    let basePoints = Math.floor((orderAmount * pointsPercentage) / 100);

    let tierMultiplier = 1.0;
    let tierName = 'Bronze';

    if (userId) {
      const user = await UserModel.findById(userId);
      if (user && tenant.settings?.tierBonusEnabled) {
        const tierKey = (user.vipTier || 'bronze').toUpperCase() as keyof typeof VIP_TIERS;
        const tierConfig = VIP_TIERS[tierKey] || VIP_TIERS.BRONZE;
        tierMultiplier = tierConfig.multiplier;
        tierName = tierConfig.name;
      }
    }

    const tierBonusPoints = Math.floor(basePoints * (tierMultiplier - 1.0));
    const totalPoints = basePoints + tierBonusPoints;

    return {
      orderAmount,
      pointsPercentage,
      basePoints,
      tier: tierName,
      tierMultiplier,
      tierBonusPoints,
      totalPoints,
      currency: tenant.settings?.currency || 'SAR',
    };
  }

  /**
   * Get user ledger transaction history with pagination
   */
  static async getUserLedger(params: {
    tenantId: string;
    userId: string;
    page?: number;
    limit?: number;
    type?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {
      tenantId: params.tenantId,
      userId: params.userId,
    };

    if (params.type) query.type = params.type;

    const [transactions, total] = await Promise.all([
      PointsLedgerModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      PointsLedgerModel.countDocuments(query),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Expire points past validity date (called by cron job)
   */
  static async processExpiredPoints(): Promise<number> {
    const now = new Date();
    const expiredTransactions = await PointsLedgerModel.find({
      expiresAt: { $lt: now },
      isExpired: false,
      status: 'CONFIRMED',
      type: { $in: ['EARN', 'BONUS'] },
    }).limit(100);

    let count = 0;
    for (const tx of expiredTransactions) {
      const user = await UserModel.findById(tx.userId);
      if (user && user.availablePoints > 0) {
        const deductAmount = Math.min(user.availablePoints, tx.amount);
        if (deductAmount > 0) {
          const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $inc: { availablePoints: -deductAmount, totalPoints: -deductAmount } },
            { new: true }
          );

          await PointsLedgerModel.create({
            tenantId: tx.tenantId,
            userId: user._id,
            type: 'EXPIRY',
            amount: -deductAmount,
            balanceAfter: updatedUser?.availablePoints || 0,
            referenceType: 'CAMPAIGN',
            referenceId: tx._id.toString(),
            description: `Points expired from transaction #${tx._id.toString().slice(-6)}`,
            status: 'CONFIRMED',
          });
        }
      }

      tx.isExpired = true;
      await tx.save();
      count++;
    }

    return count;
  }
}
