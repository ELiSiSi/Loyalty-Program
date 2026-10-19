import { FastifyReply, FastifyRequest } from 'fastify';
import { TenantService } from './tenant.service.js';
import { successResponse } from '../../utils/response.js';
import { createTenantSchema, updateTenantSchema, updateTenantPlanSchema } from './tenant.schema.js';

export class TenantController {
  static async createTenant(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = createTenantSchema.parse(request.body);
    const tenant = await TenantService.createTenant({
      ...validatedData,
      ownerId: request.user?.id,
    });
    return reply.status(201).send(successResponse(tenant, 'Tenant registered successfully.'));
  }

  static async getTenant(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenant = await TenantService.getTenantById(request.params.id);
    return reply.send(successResponse(tenant));
  }

  static async getCurrentTenant(request: FastifyRequest, reply: FastifyReply) {
    if (!request.tenant) {
      return reply.status(400).send({ success: false, message: 'No active tenant context.' });
    }
    const tenant = await TenantService.getTenantById(request.tenant.id);
    return reply.send(successResponse(tenant));
  }

  static async updateTenant(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const validatedData = updateTenantSchema.parse(request.body);
    const tenant = await TenantService.updateTenant(request.params.id, validatedData);
    return reply.send(successResponse(tenant, 'Tenant updated successfully.'));
  }

  static async changePlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { plan } = updateTenantPlanSchema.parse(request.body);
    const tenant = await TenantService.changeTenantPlan(request.params.id, plan);
    return reply.send(successResponse(tenant, `Tenant plan upgraded to ${plan}.`));
  }

  static async listTenants(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string; status?: string } }>,
    reply: FastifyReply
  ) {
    const { page, limit, search, status } = request.query;
    const result = await TenantService.listTenants({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
    });
    return reply.send(successResponse(result.tenants, 'Tenants listed successfully', {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    }));
  }
}
