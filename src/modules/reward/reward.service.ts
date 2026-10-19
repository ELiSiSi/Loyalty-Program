import { RewardModel, VoucherModel } from './reward.model.js';
import { IReward, IVoucher } from './reward.types.js';
import { PointsService } from '../points/points.service.js';
import { NotFoundError, BadRequestError } from '../../errors/appError.js';
import { generateVoucherCode } from '../../utils/crypto.js';

export class RewardService {
  static async createReward(tenantId: string, data: any): Promise<IReward> {
    const reward = await RewardModel.create({
      tenantId,
      ...data,
    });
    return reward;
  }

  static async updateReward(tenantId: string, rewardId: string, updates: any): Promise<IReward> {
    const reward = await RewardModel.findOne({ _id: rewardId, tenantId });
    if (!reward) throw new NotFoundError('Reward not found.');

    Object.assign(reward, updates);
    await reward.save();
    return reward;
  }

  static async listRewards(tenantId: string, options: { page?: number; limit?: number; activeOnly?: boolean }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId };
    if (options.activeOnly) {
      query.isActive = true;
      query.stockQuantity = { $gt: 0 };
    }

    const [rewards, total] = await Promise.all([
      RewardModel.find(query).skip(skip).limit(limit).sort({ pointsCost: 1 }),
      RewardModel.countDocuments(query),
    ]);

    return {
      rewards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async redeemReward(params: {
    tenantId: string;
    userId: string;
    rewardId: string;
    idempotencyKey?: string;
  }): Promise<{ voucher: IVoucher; qrCode: string; newBalance: number }> {
    const { tenantId, userId, rewardId, idempotencyKey } = params;

    const reward = await RewardModel.findOne({ _id: rewardId, tenantId });
    if (!reward) throw new NotFoundError('Reward not found.');

    if (!reward.isActive) {
      throw new BadRequestError('This reward is currently unavailable.');
    }

    if (reward.stockQuantity <= 0) {
      throw new BadRequestError('This reward is out of stock.');
    }

    // Atomically debit points via PointsService (guards against race conditions and negative balance!)
    const pointDebit = await PointsService.redeemPoints({
      tenantId,
      userId,
      amount: reward.pointsCost,
      referenceType: 'REWARD',
      referenceId: rewardId,
      description: `Redeemed reward: ${reward.title}`,
      idempotencyKey,
    });

    // Decrement stock
    await RewardModel.findByIdAndUpdate(rewardId, { $inc: { stockQuantity: -1 } });

    // Generate unique digital voucher code
    const voucherCode = generateVoucherCode('REW');
    const expiresAt = new Date(Date.now() + (reward.expiryDays || 30) * 24 * 60 * 60 * 1000);

    const voucher = await VoucherModel.create({
      tenantId,
      userId,
      rewardId,
      voucherCode,
      pointsDeducted: reward.pointsCost,
      status: 'ISSUED',
      expiresAt,
    });

    const { QrCodeService } = await import('../../utils/qrcode.js');
    const qrCode = await QrCodeService.generateDataUrl({
      type: 'VOUCHER_CLAIM',
      tenantId,
      voucherCode,
      rewardId,
      pointsDeducted: reward.pointsCost,
      expiresAt: expiresAt.toISOString(),
    });

    return { voucher, qrCode, newBalance: pointDebit.newBalance };
  }

  static async claimVoucher(params: {
    tenantId: string;
    voucherCode: string;
    staffId: string;
  }): Promise<IVoucher> {
    const { tenantId, voucherCode, staffId } = params;

    const voucher = await VoucherModel.findOne({
      tenantId,
      voucherCode: voucherCode.toUpperCase(),
    }).populate('rewardId');

    if (!voucher) throw new NotFoundError('Voucher code not found.');

    if (voucher.status === 'REDEEMED') {
      throw new BadRequestError(`Voucher was already claimed on ${voucher.redeemedAt?.toISOString()}.`);
    }

    if (voucher.status === 'EXPIRED' || voucher.expiresAt < new Date()) {
      voucher.status = 'EXPIRED';
      await voucher.save();
      throw new BadRequestError('This voucher has expired.');
    }

    voucher.status = 'REDEEMED';
    voucher.redeemedAt = new Date();
    voucher.claimedByStaff = staffId as any;
    await voucher.save();

    return voucher;
  }

  static async getUserVouchers(tenantId: string, userId: string) {
    return await VoucherModel.find({ tenantId, userId }).populate('rewardId').sort({ createdAt: -1 });
  }
}
