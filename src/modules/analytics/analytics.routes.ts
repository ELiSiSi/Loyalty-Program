import { FastifyInstance } from 'fastify';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/dashboard', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Analytics'],
      summary: 'Get tenant loyalty analytics, member tiers, and points liability metrics',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: AnalyticsController.getDashboard,
  });
}
