import { CampaignModel } from './campaign.model.js';
import { ICampaign } from './campaign.types.js';
import { TenantModel } from '../tenant/tenant.model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../errors/appError.js';

export class CampaignService {
  static async createCampaign(tenantId: string, data: any): Promise<ICampaign> {
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found.');

    // Check tenant quota limit for active campaigns
    const activeCampaignsCount = await CampaignModel.countDocuments({ tenantId, isActive: true });
    if (activeCampaignsCount >= tenant.limits.maxCampaigns) {
      throw new ForbiddenError(
        `Campaign limit reached for your plan (${tenant.limits.maxCampaigns} max campaigns). Upgrade your SaaS plan.`
      );
    }

    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestError('Campaign end date must be after start date.');
    }

    const campaign = await CampaignModel.create({
      tenantId,
      ...data,
      startsAt,
      endsAt,
    });

    return campaign;
  }

  static async getCampaignById(tenantId: string, campaignId: string): Promise<ICampaign> {
    const campaign = await CampaignModel.findOne({ _id: campaignId, tenantId });
    if (!campaign) throw new NotFoundError('Campaign not found.');
    return campaign;
  }

  static async updateCampaign(tenantId: string, campaignId: string, updates: any): Promise<ICampaign> {
    const campaign = await CampaignModel.findOne({ _id: campaignId, tenantId });
    if (!campaign) throw new NotFoundError('Campaign not found.');

    if (updates.startsAt) updates.startsAt = new Date(updates.startsAt);
    if (updates.endsAt) updates.endsAt = new Date(updates.endsAt);

    Object.assign(campaign, updates);
    await campaign.save();
    return campaign;
  }

  static async deleteCampaign(tenantId: string, campaignId: string): Promise<void> {
    const deleted = await CampaignModel.findOneAndDelete({ _id: campaignId, tenantId });
    if (!deleted) throw new NotFoundError('Campaign not found.');
  }

  static async listCampaigns(tenantId: string, options: { page?: number; limit?: number; activeOnly?: boolean }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId };
    if (options.activeOnly) {
      const now = new Date();
      query.isActive = true;
      query.startsAt = { $lte: now };
      query.endsAt = { $gte: now };
    }

    const [campaigns, total] = await Promise.all([
      CampaignModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      CampaignModel.countDocuments(query),
    ]);

    return {
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
