import { UserModel } from './user.model.js';
import { IUser } from './user.types.js';
import { NotFoundError, BadRequestError } from '../../errors/appError.js';
import { VIP_TIERS, VipTierCode } from '../../constants/tiers.js';

export class UserService {
  static async getUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).populate('tenantId', 'name slug logo');
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return user;
  }

  static async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.photo) user.photo = data.photo;

    await user.save({ validateBeforeSave: false });
    return user;
  }

  static async recalculateVipTier(userId: string): Promise<VipTierCode> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const points = user.lifetimePoints || 0;
    let newTier: VipTierCode = 'BRONZE';

    if (points >= VIP_TIERS.PLATINUM.minPoints) {
      newTier = 'PLATINUM';
    } else if (points >= VIP_TIERS.GOLD.minPoints) {
      newTier = 'GOLD';
    } else if (points >= VIP_TIERS.SILVER.minPoints) {
      newTier = 'SILVER';
    }

    if (user.vipTier.toUpperCase() !== newTier) {
      user.vipTier = newTier.toLowerCase() as any;
      await user.save({ validateBeforeSave: false });
    }

    return newTier;
  }

  static async listMembersByTenant(tenantId: string, filter: {
    page?: number;
    limit?: number;
    search?: string;
    tier?: string;
    role?: string;
  }) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {
      $or: [{ tenantId }, { company: tenantId }],
    };

    if (filter.tier) query.vipTier = filter.tier.toLowerCase();
    if (filter.role) query.role = filter.role;
    if (filter.search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: filter.search, $options: 'i' } },
            { email: { $regex: filter.search, $options: 'i' } },
            { phone: { $regex: filter.search, $options: 'i' } },
          ],
        },
      ];
    }

    const [members, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return {
      members,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async setUserStatus(userId: string, isActive: boolean): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    user.is_active = isActive;
    await user.save({ validateBeforeSave: false });
    return user;
  }
}
