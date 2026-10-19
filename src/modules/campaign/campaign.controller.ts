import { FastifyReply, FastifyRequest } from 'fastify';
import { CampaignService } from './campaign.service.js';
import { successResponse } from '../../utils/response.js';
import { createCampaignSchema, updateCampaignSchema } from './campaign.schema.js';

export class CampaignController {
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCampaignSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const campaign = await CampaignService.createCampaign(tenantId!, data);
    return reply.status(201).send(successResponse(campaign, 'Campaign launched successfully.'));
  }

  static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const campaign = await CampaignService.getCampaignById(tenantId!, request.params.id);
    return reply.send(successResponse(campaign));
  }

  static async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = updateCampaignSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const campaign = await CampaignService.updateCampaign(tenantId!, request.params.id, data);
    return reply.send(successResponse(campaign, 'Campaign updated successfully.'));
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    await CampaignService.deleteCampaign(tenantId!, request.params.id);
    return reply.send(successResponse(null, 'Campaign removed successfully.'));
  }

  static async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; activeOnly?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, activeOnly } = request.query;

    const result = await CampaignService.listCampaigns(tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      activeOnly: activeOnly === 'true' || request.user?.role === 'user',
    });

    return reply.send(
      successResponse(result.campaigns, 'Campaigns retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }
}
