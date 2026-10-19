import { FastifyReply, FastifyRequest } from 'fastify';
import { AnalyticsService } from './analytics.service.js';
import { successResponse } from '../../utils/response.js';

export class AnalyticsController {
  static async getDashboard(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const metrics = await AnalyticsService.getTenantDashboardMetrics(tenantId!);
    return reply.send(successResponse(metrics, 'Tenant analytics retrieved successfully.'));
  }
}
