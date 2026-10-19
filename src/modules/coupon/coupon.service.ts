import { CouponModel } from './coupon.model.js';
import { ICoupon } from './coupon.types.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors/appError.js';

export class CouponService {
  static async createCoupon(tenantId: string, data: any): Promise<ICoupon> {
    const existing = await CouponModel.findOne({ tenantId, code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictError(`Coupon with code '${data.code}' already exists for this tenant.`);
    }

    const coupon = await CouponModel.create({
      tenantId,
      ...data,
      code: data.code.toUpperCase(),
      startsAt: new Date(data.startsAt),
      expiresAt: new Date(data.expiresAt),
    });

    return coupon;
  }

  static async validateCoupon(tenantId: string, code: string, orderAmount: number) {
    const coupon = await CouponModel.findOne({ tenantId, code: code.toUpperCase() });
    if (!coupon) {
      throw new NotFoundError('Coupon code not found.');
    }

    if (!coupon.isActive) {
      throw new BadRequestError('Coupon is currently deactivated.');
    }

    const now = new Date();
    if (now < coupon.startsAt) {
      throw new BadRequestError('Coupon campaign has not started yet.');
    }

    if (now > coupon.expiresAt) {
      throw new BadRequestError('Coupon code has expired.');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestError('Coupon usage limit has been reached.');
    }

    if (orderAmount < coupon.minSpend) {
      throw new BadRequestError(
        `Minimum order amount to use this coupon is ${coupon.minSpend}.`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.discount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(orderAmount, coupon.discount);
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return {
      couponId: coupon._id.toString(),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discount,
      discountAmount,
      finalAmount,
    };
  }

  static async recordCouponUsage(tenantId: string, couponId: string): Promise<void> {
    await CouponModel.findOneAndUpdate(
      { _id: couponId, tenantId },
      { $inc: { usedCount: 1 } }
    );
  }

  static async listCoupons(tenantId: string, options: { page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      CouponModel.find({ tenantId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      CouponModel.countDocuments({ tenantId }),
    ]);

    return {
      coupons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async deleteCoupon(tenantId: string, couponId: string): Promise<void> {
    const deleted = await CouponModel.findOneAndDelete({ _id: couponId, tenantId });
    if (!deleted) throw new NotFoundError('Coupon not found.');
  }
}
