import { TenantModel } from './tenant.model.js';
import { ITenant } from './tenant.types.js';
import { SAAS_PLANS } from '../../constants/plans.js';
import { NotFoundError, ConflictError } from '../../errors/appError.js';

export class TenantService {
  static async createTenant(data: {
    name: string;
    slug?: string;
    category?: string;
    logo?: string;
    plan?: 'free' | 'starter' | 'growth' | 'enterprise';
    currency?: string;
    pointsPercentage?: number;
    pointsExpiryDays?: number;
    ownerId?: string;
  }): Promise<ITenant> {
    const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).toLowerCase();
    const code = slug.slice(0, 8);

    const existing = await TenantModel.findOne({ $or: [{ name: data.name }, { slug }, { code }] });
    if (existing) {
      throw new ConflictError('Tenant with this name, slug, or code already exists.');
    }

    const planKey = (data.plan?.toUpperCase() as keyof typeof SAAS_PLANS) || 'FREE';
    const planConfig = SAAS_PLANS[planKey] || SAAS_PLANS.FREE;

    const tenant = await TenantModel.create({
      name: data.name,
      slug,
      code,
      category: data.category || 'Retail',
      logo: data.logo,
      plan: planConfig.name,
      status: 'active',
      settings: {
        currency: data.currency || 'SAR',
        pointsPercentage: data.pointsPercentage ?? 1,
        pointsExpiryDays: data.pointsExpiryDays ?? 365,
        tierBonusEnabled: true,
      },
      limits: {
        maxUsers: planConfig.maxUsers,
        maxCampaigns: planConfig.maxCampaigns,
        monthlyTransactionLimit: planConfig.monthlyTransactionLimit,
      },
      owner: data.ownerId,
    });

    return tenant;
  }

  static async getTenantById(id: string): Promise<ITenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant not found.');
    }
    return tenant;
  }

  static async getTenantBySlug(slug: string): Promise<ITenant> {
    const tenant = await TenantModel.findOne({ slug: slug.toLowerCase() });
    if (!tenant) {
      throw new NotFoundError(`Tenant with slug '${slug}' not found.`);
    }
    return tenant;
  }

  static async updateTenant(id: string, updates: Partial<any>): Promise<ITenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant not found.');
    }

    if (updates.name) tenant.name = updates.name;
    if (updates.category) tenant.category = updates.category;
    if (updates.logo) tenant.logo = updates.logo;

    if (updates.currency || updates.pointsPercentage !== undefined || updates.pointsExpiryDays !== undefined) {
      tenant.settings = {
        ...tenant.settings,
        ...(updates.currency ? { currency: updates.currency } : {}),
        ...(updates.pointsPercentage !== undefined ? { pointsPercentage: updates.pointsPercentage } : {}),
        ...(updates.pointsExpiryDays !== undefined ? { pointsExpiryDays: updates.pointsExpiryDays } : {}),
      };
    }

    await tenant.save();
    return tenant;
  }

  static async changeTenantPlan(id: string, plan: 'free' | 'starter' | 'growth' | 'enterprise'): Promise<ITenant> {
    const tenant = await TenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant not found.');
    }

    const planKey = plan.toUpperCase() as keyof typeof SAAS_PLANS;
    const planConfig = SAAS_PLANS[planKey] || SAAS_PLANS.FREE;

    tenant.plan = planConfig.name;
    tenant.limits = {
      maxUsers: planConfig.maxUsers,
      maxCampaigns: planConfig.maxCampaigns,
      monthlyTransactionLimit: planConfig.monthlyTransactionLimit,
    };

    await tenant.save();
    return tenant;
  }

  static async listTenants(filter: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filter.status) query.status = filter.status;
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { slug: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      TenantModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      TenantModel.countDocuments(query),
    ]);

    return {
      tenants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
