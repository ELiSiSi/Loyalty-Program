import { FastifyInstance } from 'fastify';
import { AuditService } from './audit.service.js';
import { successResponse } from '../../utils/response.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function auditRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Audit'],
      summary: 'List tenant audit logs for compliance & security review',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const { page, limit, action } = request.query as any;

      const result = await AuditService.listAudits(tenantId!, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        action,
      });

      return reply.send(
        successResponse(result.logs, 'Audit logs retrieved', {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        })
      );
    },
  });
}
